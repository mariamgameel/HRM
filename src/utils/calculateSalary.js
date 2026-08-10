const calculateSalary = (baseSalary, bonus, deductions) => {
    return baseSalary + bonus - deductions;
};

module.exports = calculateSalary;