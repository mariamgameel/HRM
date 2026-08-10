const ROLES = {
    ADMIN: "admin",
    HR: "hr",
    EMPLOYEE: "employee",
};

const ACTIVE_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};

const ATTENDANCE_STATUS = {
    PRESENT: "present",
    LATE: "late",
    ABSENT: "absent",
    ON_LEAVE: "on_leave",
};

const LEAVE_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

const LEAVE_TYPE = {
    SICK: "sick",
    ANNUAL: "annual",
    UNPAID: "unpaid",
    OTHER: "other",
};

module.exports = {
    ROLES,
    ACTIVE_STATUS,
    ATTENDANCE_STATUS,
    LEAVE_STATUS,
    LEAVE_TYPE,
};