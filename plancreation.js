function createDays(planFromDb){
  const days = {}
  days.pointValue3 = []
  days.pointValue2 = []
  days.pointValue1 = []
  
  // Returns
  // {
  //   pointValue1: [DayFromSchema],
  //   pointValue2: [DayFromSchema],
  //   pointValue3: [DayFromSchema]
  // }
  planFromDb.days.forEach(day => {
    switch(day.pointValue){
        case 1: 
          days.pointValue1.push(day)
          break
        case 2:
          days.pointValue2.push(day)
          break
        case 3:
          days.pointValue3.push(day)
          break
      default:
          break
    }
  })
  return days // Tested, Works!!!!
}

// Returns
// {
//   house: [{
//     doctorId: String,
//     name: String,
//     clinic: String,
//     only12: Boolean,
//     maximumDutys: Number,
//     dutyWish: [Number],
//     noDutyWish: [Number]
//   }]  
//   emergencyDepartment: [{
//     doctorId: String,
//     name: String,
//     clinic: String,
//     only12: Boolean,
//     maximumDutys: Number,
//     dutyWish: [Number],
//     noDutyWish: [Number]
//   }]
// }
function createDoctors(wishes, doctorsFromDb){
  const doctors = {}
  doctors.house = []
  doctors.emergencyDepartment = []
  
  doctorsFromDb.forEach(doctor => {
    doc = {
      doctorId: String(doctor._id),
      name: doctor.name,
      clinic: doctor.clinic,
      only12: doctor.only12,
      maximumDutys: doctor.maximumDutys,
      dutyWish: wishes.find(wish => wish.doctorId === String(doctor._id)).dutyWish,
      noDutyWish: wishes.find(wish => wish.doctorId === String(doctor._id)).noDutyWish
    }
    if (doctor.house){
      doctors.house.push(doc)
    }
    if (doctor.emergencyDepartment){
      doctors.emergencyDepartment.push(doc)
    }
  })
  return doctors // Tested, Working. Not sure if it realy shows wishes since this feature is not yet in DB (there are no wishes for testing)
}

exports.generatePlan = function generatePlan(planFromDb, wishes, doctorsFromDb){
  days = createDays(planFromDb)
  doctors = createDoctors(wishes, doctorsFromDb)
  // fillEmergencyDepartment(days, doctors, 3)
  // .then((days, doctors) => fillHouse(days, doctors, 3))
  // .then((days, doctors) => fillEmergencyDepartment(days, doctors, 2))
  // .then((days, doctors) => fillHouse(days, doctors, 2))
  // .then((days, doctors) => fillEmergencyDepartment(days, doctors, 1))
  // .then((days, doctors) => fillHouse(days, doctors, 1))
  //  .then((plan) => {
  //    return plan
  //  })
}
