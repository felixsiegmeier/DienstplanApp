function createDays(planFromDb){
  const days = {}
  const days.pointValue3 = []
  const days.pointValue2 = []
  const days.pointValue1 = []
  
  planFromDb.forEach(day => {
    switch(day.pointValue){
        1: 
          days.pointValue1.push(day)
          break
        2:
          days.pointValue2.push(day)
          break
        3:
          days.pointValue2.push(day)
          break
      default:
          break
    }
  })
  return days
}

function createDoctors(wishlist, doctorsFromDb){
  const doctors = {}
  const doctors.House = []
  const doctors.EmergencyDepartment = []
  
}

exports.generatePlan = function generatePlan(planFromDb, wishlistFromDb, doctorsFromDb){
  days = createDays(planFromDb)
  doctors = createDoctors(wishlistFromDb, doctorsFromDb)
  fillEmergencyDepartment(days, doctors, 3)
  .then((days, doctors) => fillHouse(days, doctors, 3))
  .then((days, doctors) => fillEmergencyDepartment(days, doctors, 2))
  .then((days, doctors) => fillHouse(days, doctors, 2))
  .then((days, doctors) => fillEmergencyDepartment(days, doctors, 1))
  .then((days, doctors) => fillHouse(days, doctors, 1))
   .then((plan) => {
     return plan
   })
}
