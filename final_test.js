// Final test to verify the double shift prevention functionality

console.log('=== Final Test for Double Shift Prevention ===\n');

// Simplified test of the actual implemented functions
const employees = [
    {
        id: 'emp1',
        name: 'John Doe',
        defaultStartTime: '08:00',
        defaultEndTime: '16:00',
        position: 'Developer'
    }
];

const schedules = {
    'test-week': {
        '2023-10-02': [
            {
                id: 'shift1',
                employeeId: 'emp1',
                date: '2023-10-02',
                startTime: '08:00',
                endTime: '16:00',
                position: 'Developer',
                type: 'regular'
            }
        ]
    }
};

// Parse time function
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Check if employee already has a shift on date
function hasEmployeeShiftOnDate(employeeId, date) {
    // Check all weeks for shifts on this date for this employee
    for (const weekKey in schedules) {
        if (schedules[weekKey] && schedules[weekKey][date]) {
            const shifts = schedules[weekKey][date];
            for (const shift of shifts) {
                if (String(shift.employeeId) === String(employeeId)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check shift overlap
function checkShiftOverlap(employeeId, date, startTime, endTime, excludeShiftId = null) {
    // Check all weeks for shifts on this date for this employee
    for (const weekKey in schedules) {
        if (schedules[weekKey] && schedules[weekKey][date]) {
            const shifts = schedules[weekKey][date];
            for (const shift of shifts) {
                // Skip the shift we're editing (if specified)
                if (excludeShiftId && shift.id === excludeShiftId) {
                    continue;
                }
                
                // Only check for the same employee
                if (String(shift.employeeId) === String(employeeId)) {
                    // Check if time ranges overlap
                    const existingStart = parseTime(shift.startTime);
                    const existingEnd = parseTime(shift.endTime);
                    const newStart = parseTime(startTime);
                    const newEnd = parseTime(endTime);
                    
                    // Overlap occurs if: (StartA < EndB) and (EndA > StartB)
                    if (newStart < existingEnd && newEnd > existingStart) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// Test cases
console.log('Test 1: Check if employee has shift on date');
const hasShift = hasEmployeeShiftOnDate('emp1', '2023-10-02');
console.log('Result:', hasShift ? 'PASS - Employee has shift' : 'FAIL');

console.log('\nTest 2: Check if employee has shift on different date');
const hasShiftDifferentDate = hasEmployeeShiftOnDate('emp1', '2023-10-03');
console.log('Result:', !hasShiftDifferentDate ? 'PASS - Employee does not have shift on different date' : 'FAIL');

console.log('\nTest 3: Check for overlapping shift (same time)');
const overlapSameTime = checkShiftOverlap('emp1', '2023-10-02', '08:00', '16:00');
console.log('Result:', overlapSameTime ? 'PASS - Correctly detected overlap' : 'FAIL');

console.log('\nTest 4: Check for overlapping shift (partial overlap)');
const overlapPartial = checkShiftOverlap('emp1', '2023-10-02', '10:00', '18:00');
console.log('Result:', overlapPartial ? 'PASS - Correctly detected partial overlap' : 'FAIL');

console.log('\nTest 5: Check for non-overlapping shift');
const noOverlap = checkShiftOverlap('emp1', '2023-10-02', '17:00', '19:00');
console.log('Result:', !noOverlap ? 'PASS - Correctly detected no overlap' : 'FAIL');

console.log('\nTest 6: Check for overlap with excluded shift (editing scenario)');
const overlapExcluded = checkShiftOverlap('emp1', '2023-10-02', '10:00', '18:00', 'shift1');
console.log('Result:', !overlapExcluded ? 'PASS - Correctly ignored excluded shift' : 'FAIL');

console.log('\n=== Final Test Completed ===');