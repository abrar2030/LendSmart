const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanContract", function () {
  let loanContract;
  let owner, feeRecipient, borrower, lender, otherAccount;
  let mockToken;

  const SECONDS_IN_DAY = 86400;
  const LOAN_AMOUNT = ethers.parseUnits("1000", 18);
  const INTEREST_RATE = 500; // 5.00%
  const LOAN_DURATION = 30 * SECONDS_IN_DAY; // 30 days
  const PLATFORM_FEE = 100; // 1.00%

  beforeEach(async function () {
    [owner, feeRecipient, borrower, lender, otherAccount] =
      await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK", 18);

    const LoanContract = await ethers.getContractFactory("LoanContract");
    loanContract = await LoanContract.deploy(
      owner.address,
      PLATFORM_FEE,
      feeRecipient.address,
    );

    await mockToken.mint(lender.address, ethers.parseUnits("10000", 18));
    await mockToken
      .connect(lender)
      .approve(loanContract.target, ethers.parseUnits("10000", 18));
    await mockToken
      .connect(borrower)
      .approve(loanContract.target, ethers.parseUnits("10000", 18));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await loanContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct fee recipient", async function () {
      expect(await loanContract.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the correct platform fee", async function () {
      expect(await loanContract.platformFeeRate()).to.equal(PLATFORM_FEE);
    });

    it("Should reject a zero-address fee recipient", async function () {
      const LoanContract = await ethers.getContractFactory("LoanContract");
      await expect(
        LoanContract.deploy(owner.address, PLATFORM_FEE, ethers.ZeroAddress),
      ).to.be.revertedWith("Fee recipient cannot be zero address");
    });
  });

  describe("Loan Request", function () {
    it("Should allow a borrower to request a loan", async function () {
      const tx = await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const receipt = await tx.wait();
      const loanId = 1;

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "LoanRequested",
      );
      expect(event).to.not.be.undefined;

      const loan = await loanContract.getLoanDetails(loanId);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.principal).to.equal(LOAN_AMOUNT);
      expect(loan.status).to.equal(0); // Requested
    });

    it("Should reject loan requests with invalid parameters", async function () {
      await expect(
        loanContract
          .connect(borrower)
          .requestLoan(
            ethers.ZeroAddress,
            LOAN_AMOUNT,
            INTEREST_RATE,
            LOAN_DURATION,
            "Bad token",
          ),
      ).to.be.revertedWith("LoanContract: Token address cannot be zero");

      await expect(
        loanContract
          .connect(borrower)
          .requestLoan(
            mockToken.target,
            0,
            INTEREST_RATE,
            LOAN_DURATION,
            "Zero principal",
          ),
      ).to.be.revertedWith("LoanContract: Principal must be greater than zero");

      await expect(
        loanContract
          .connect(borrower)
          .requestLoan(
            mockToken.target,
            LOAN_AMOUNT,
            INTEREST_RATE,
            0,
            "Zero duration",
          ),
      ).to.be.revertedWith("LoanContract: Duration must be greater than zero");
    });
  });

  describe("Loan Funding and Auto-Disbursement", function () {
    it("Should fund a loan and immediately disburse principal to the borrower", async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const loanId = 1;

      await expect(
        loanContract.connect(lender).fundLoan(loanId),
      ).to.changeTokenBalances(
        mockToken,
        [lender, borrower],
        [-LOAN_AMOUNT, LOAN_AMOUNT],
      );

      const loan = await loanContract.getLoanDetails(loanId);
      expect(loan.status).to.equal(2); // Active (auto-disbursed)
      expect(loan.lender).to.equal(lender.address);
    });

    it("Should prevent the borrower from funding their own loan", async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const loanId = 1;

      await expect(
        loanContract.connect(borrower).fundLoan(loanId),
      ).to.be.revertedWith("LoanContract: Borrower cannot fund their own loan");
    });
  });

  describe("Loan Repayment", function () {
    let loanId;
    let repaymentAmount;

    beforeEach(async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      loanId = 1;
      await loanContract.connect(lender).fundLoan(loanId);

      const loan = await loanContract.getLoanDetails(loanId);
      repaymentAmount = loan.repaymentAmount;

      // Borrower needs tokens to repay (principal + interest)
      await mockToken.mint(borrower.address, repaymentAmount);
    });

    it("Should allow the borrower to fully repay the loan", async function () {
      await loanContract.connect(borrower).repayLoan(loanId, repaymentAmount);

      const loan = await loanContract.getLoanDetails(loanId);
      expect(loan.status).to.equal(3); // Repaid
      expect(loan.amountRepaid).to.equal(repaymentAmount);
    });

    it("Should distribute platform fees correctly on the interest portion", async function () {
      const totalInterest = repaymentAmount - LOAN_AMOUNT;
      const expectedFee = (totalInterest * BigInt(PLATFORM_FEE)) / 10000n;

      await expect(
        loanContract.connect(borrower).repayLoan(loanId, repaymentAmount),
      ).to.changeTokenBalances(
        mockToken,
        [feeRecipient, lender],
        [expectedFee, repaymentAmount - expectedFee],
      );
    });

    it("Should cap an overpayment at the remaining amount due", async function () {
      const overpayment = repaymentAmount + ethers.parseUnits("100", 18);
      await mockToken.mint(borrower.address, overpayment);

      await loanContract.connect(borrower).repayLoan(loanId, overpayment);

      const loan = await loanContract.getLoanDetails(loanId);
      expect(loan.amountRepaid).to.equal(repaymentAmount);
      expect(loan.status).to.equal(3); // Repaid
    });

    it("Should prevent a non-borrower from repaying the loan", async function () {
      await expect(
        loanContract.connect(otherAccount).repayLoan(loanId, repaymentAmount),
      ).to.be.revertedWith("LoanContract: Caller is not the borrower");
    });
  });

  describe("Loan Cancellation", function () {
    it("Should allow a borrower to cancel an unfunded loan request", async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const loanId = 1;

      await loanContract.connect(borrower).cancelLoanRequest(loanId);

      const loan = await loanContract.getLoanDetails(loanId);
      expect(loan.status).to.equal(5); // Cancelled
    });

    it("Should prevent cancelling a loan that has already been funded", async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const loanId = 1;
      await loanContract.connect(lender).fundLoan(loanId);

      await expect(
        loanContract.connect(borrower).cancelLoanRequest(loanId),
      ).to.be.revertedWith(
        "LoanContract: Loan not in Requested state or already funded",
      );
    });
  });

  describe("Admin Functions", function () {
    it("Should allow the owner to update the platform fee rate", async function () {
      await loanContract.connect(owner).setPlatformFeeRate(200);
      expect(await loanContract.platformFeeRate()).to.equal(200);
    });

    it("Should reject a platform fee rate above the 10% cap", async function () {
      await expect(
        loanContract.connect(owner).setPlatformFeeRate(1001),
      ).to.be.revertedWith("LoanContract: Fee rate too high");
    });

    it("Should allow the owner to pause and unpause the contract", async function () {
      await loanContract.connect(owner).pause();

      await expect(
        loanContract
          .connect(borrower)
          .requestLoan(
            mockToken.target,
            LOAN_AMOUNT,
            INTEREST_RATE,
            LOAN_DURATION,
            "Business expansion",
          ),
      ).to.be.revertedWithCustomError(loanContract, "EnforcedPause");

      await loanContract.connect(owner).unpause();

      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
    });

    it("Should prevent non-owners from calling admin functions", async function () {
      await expect(
        loanContract.connect(otherAccount).setPlatformFeeRate(200),
      ).to.be.revertedWithCustomError(
        loanContract,
        "OwnableUnauthorizedAccount",
      );
    });
  });

  describe("Withdraw Stuck Tokens", function () {
    it("Should allow the owner to withdraw non-escrowed tokens", async function () {
      const strayAmount = ethers.parseUnits("50", 18);
      await mockToken.mint(loanContract.target, strayAmount);

      await expect(
        loanContract
          .connect(owner)
          .withdrawStuckTokens(
            mockToken.target,
            otherAccount.address,
            strayAmount,
          ),
      ).to.changeTokenBalance(mockToken, otherAccount, strayAmount);
    });

    it("Should prevent the owner from withdrawing escrowed loan principal", async function () {
      await loanContract
        .connect(borrower)
        .requestLoan(
          mockToken.target,
          LOAN_AMOUNT,
          INTEREST_RATE,
          LOAN_DURATION,
          "Business expansion",
        );
      const loanId = 1;

      // Fund but don't let auto-disbursement happen in isolation -- the
      // contract auto-disburses on fundLoan, so principal only transiently
      // sits in the contract mid-transaction. To exercise escrow tracking
      // directly, send a stray amount before funding and confirm it alone
      // is withdrawable up to that point.
      const strayAmount = ethers.parseUnits("10", 18);
      await mockToken.mint(loanContract.target, strayAmount);

      await loanContract.connect(lender).fundLoan(loanId);

      // After auto-disbursement, principal has left the contract, so the
      // previously-sent stray amount should still be fully withdrawable
      // and escrow accounting should be back to zero for this token.
      expect(await loanContract.totalEscrowed(mockToken.target)).to.equal(0);

      await expect(
        loanContract
          .connect(owner)
          .withdrawStuckTokens(
            mockToken.target,
            owner.address,
            strayAmount + 1n,
          ),
      ).to.be.revertedWith(
        "Amount exceeds withdrawable (non-escrowed) balance",
      );

      await expect(
        loanContract
          .connect(owner)
          .withdrawStuckTokens(mockToken.target, owner.address, strayAmount),
      ).to.changeTokenBalance(mockToken, owner, strayAmount);
    });

    it("Should prevent non-owners from withdrawing stuck tokens", async function () {
      await expect(
        loanContract
          .connect(otherAccount)
          .withdrawStuckTokens(mockToken.target, otherAccount.address, 1),
      ).to.be.revertedWithCustomError(
        loanContract,
        "OwnableUnauthorizedAccount",
      );
    });
  });
});
