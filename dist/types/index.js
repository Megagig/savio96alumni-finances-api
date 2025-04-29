"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.PaymentType = exports.LoanStatus = exports.PaymentStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MEMBER"] = "member";
    UserRole["ADMIN_LEVEL_1"] = "admin_level_1";
    UserRole["ADMIN_LEVEL_2"] = "admin_level_2";
    UserRole["SUPER_ADMIN"] = "super_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["APPROVED"] = "approved";
    PaymentStatus["REJECTED"] = "rejected";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["PAID"] = "paid";
    LoanStatus["DEFAULTED"] = "defaulted";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["DUE"] = "due";
    PaymentType["LEVY"] = "levy";
    PaymentType["PLEDGE"] = "pledge";
    PaymentType["DONATION"] = "donation";
    PaymentType["LOAN_REPAYMENT"] = "loan_repayment";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "income";
    TransactionType["EXPENSE"] = "expense";
    TransactionType["CREDIT"] = "credit";
    TransactionType["DEBIT"] = "debit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
