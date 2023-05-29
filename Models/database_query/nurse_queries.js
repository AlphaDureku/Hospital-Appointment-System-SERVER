const model = require("../models");
const Sequelize = require("sequelize");

const age = Sequelize.fn(
  "TIMESTAMPDIFF",
  Sequelize.literal("YEAR"),
  Sequelize.literal("patient_dateOfBirth"),
  Sequelize.fn("NOW")
);

exports.findNurseUsingUsername = async function (username) {
  return await model.doctor_Secretary.findOne({
    raw: true,
    where: {
      doctor_Secretary_username: username,
    },
  });
};

exports.findNurseUsingEmail = async function (email) {
  return await model.doctor_Secretary.findOne({
    raw: true,
    where: {
      doctor_Secretary_email: email,
    },
  });
};

exports.findNurseUsingID = async function (sec_ID) {
  return await model.doctor_Secretary.findOne({
    raw: true,
    attributes: [
      "doctor_Secretary_first_name",
      "doctor_Secretary_middle_name",
      "doctor_Secretary_last_name",
    ],
    where: {
      doctor_Secretary_ID: sec_ID,
    },
  });
};

exports.findNurseUsingIDReturnPassword = async function (nurse_ID) {
  return await model.doctor_Secretary.findOne({
    raw: true,
    attributes: ["doctor_Secretary_password"],
    where: {
      doctor_Secretary_ID: nurse_ID,
    },
  });
};

exports.findDoctors = async function (sec_ID) {
  return await model.doctor.findAll({
    raw: true,
    attributes: ["doctor_ID", "doctor_first_name", "doctor_last_name"],
    include: [
      {
        attributes: [],
        model: model.doctor_Secretary,
        where: {
          doctor_Secretary_ID: sec_ID,
        },
      },
    ],
  });
};

exports.getSelectedDoctorAppointments = async function (
  doctor_ID,
  DateRange,
  nameQuery
) {
  return await model.appointmentDetails.findAll({
    raw: true,
    attributes: [
      "patient_ID",
      "appointment_ID",
      [age, "patient_age"],
      [Sequelize.col("user_email"), "email"],
      [Sequelize.col("patient_first_name"), "Fname"],
      [Sequelize.col("patient_last_name"), "Lname"],
      [Sequelize.col("patient_gender"), "gender"],
      [Sequelize.col("patient_address"), "patient_address"],
      [Sequelize.col("patient_contact_number"), "Contact"],
      [Sequelize.col("appointment_status"), "Status"],
      [Sequelize.col("doctor_first_name"), "doctor_Fname"],
      [Sequelize.col("specialization_Name"), "specialization"],
      [Sequelize.col("doctor_last_name"), "doctor_Lname"],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("appointmentDetails.createdAt"),
          "%M %e, %Y"
        ),
        "createdAt",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%M %e, %Y"
        ),
        "appointmentDate",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_start_time"),
          "%h:%i%p"
        ),
        "start",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_start_time"),
          "%h:%i%p"
        ),
        "end",
      ],
    ],

    include: [
      {
        model: model.patient,
        attributes: [],
        include: [
          {
            model: model.user,
            attributes: [],
          },
        ],
        where: nameQuery
          ? [
              {
                [Sequelize.Op.or]: [
                  {
                    patient_first_name: {
                      [Sequelize.Op.like]: `%${nameQuery}%`,
                    },
                  },
                  {
                    patient_last_name: {
                      [Sequelize.Op.like]: `%${nameQuery}%`,
                    },
                  },
                ],
              },
            ]
          : null,
      },
      {
        model: model.doctor_schedule_table,
        attributes: [],
      },
      {
        model: model.doctor,
        attributes: [],
        required: true,
        include: [
          {
            model: model.doctor_specialization,
            attributes: [],
          },
        ],
      },
    ],
    where: [
      {
        doctor_ID: doctor_ID,
        createdAt: {
          [Sequelize.Op.between]: [DateRange.start, DateRange.end],
        },
      },
    ],
  });
};

exports.getDoctorCalendar = async function (doctor_ID) {
  return await model.doctor.findAll({
    raw: true,
    attributes: [
      "doctor_ID",
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%b %e, %Y"
        ),
        "date",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%Y-%m-%d"
        ),
        "date2",
      ],
      [Sequelize.col("doctor_schedule_start_time"), "start"],
      [Sequelize.col("doctor_schedule_end_time"), "end"],
    ],
    include: [
      {
        model: model.doctor_schedule_table,
        required: true,
        attributes: [],
      },
    ],
    where: { doctor_ID: doctor_ID },
  });
};

exports.updateAppointmentStatus = async function (
  updateStatus,
  appointment_ID
) {
  await model.appointmentDetails.update(
    {
      appointment_status: updateStatus,
    },
    {
      where: {
        appointment_ID: appointment_ID,
      },
    }
  );
};

exports.getDoctorEmailUsingID = async function (doctor_ID) {
  return await model.doctor.findOne({
    raw: true,
    attributes: [
      "doctor_email",
      [Sequelize.col("doctor_Secretary_first_name"), "Fname"],
      [Sequelize.col("doctor_Secretary_last_name"), "Lname"],
    ],
    include: [
      {
        model: model.doctor_Secretary,
        attributes: [],
      },
    ],
    where: {
      doctor_ID: doctor_ID,
    },
  });
};

exports.getAppointmentsThatDate = async function (doctor_ID, date) {
  return await model.appointmentDetails.findAll({
    raw: true,
    attributes: [
      "patient_ID",
      "appointment_ID",
      [age, "patient_age"],
      [Sequelize.col("user_email"), "email"],
      [Sequelize.col("patient_first_name"), "Fname"],
      [Sequelize.col("patient_last_name"), "Lname"],
      [Sequelize.col("patient_gender"), "gender"],
      [Sequelize.col("patient_address"), "patient_address"],
      [Sequelize.col("patient_contact_number"), "Contact"],
      [Sequelize.col("appointment_status"), "Status"],
      [Sequelize.col("doctor_first_name"), "doctor_Fname"],
      [Sequelize.col("specialization_Name"), "specialization"],
      [Sequelize.col("doctor_last_name"), "doctor_Lname"],
      [Sequelize.col("appointment_start"), "appointmentStart"],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("appointmentDetails.createdAt"),
          "%M %e, %Y"
        ),
        "createdAt",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%M %e, %Y"
        ),
        "appointmentDate",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_start_time"),
          "%h:%i%p"
        ),
        "start",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_end_time"),
          "%h:%i%p"
        ),
        "end",
      ],
    ],
    include: [
      {
        model: model.doctor,
        attributes: [],
        include: [
          {
            model: model.doctor_specialization,
            attributes: [],
          },
        ],
      },
      {
        model: model.patient,
        attributes: [],
        include: [
          {
            model: model.user,
            attributes: [],
          },
        ],
      },
      {
        model: model.doctor_schedule_table,
        attributes: [],
        where: {
          doctor_schedule_date: date,
        },
      },
    ],
    where: {
      doctor_ID: doctor_ID,
      appointment_status: "Confirmed",
    },
  });
};

exports.insertDoctorAvailability = async function (schedule_tableModel) {
  return await model.doctor_schedule_table.create(schedule_tableModel);
};

exports.updatePassword = async function (newPassword, nurse_ID) {
  await model.doctor_Secretary.update(
    {
      doctor_Secretary_password: newPassword,
    },
    {
      where: {
        doctor_Secretary_ID: nurse_ID,
      },
    }
  );
};

//Still havent implemented yet

exports.getContactUsingApp_ID = async function (ID) {
  return await model.appointmentDetails.findOne({
    raw: true,
    attributes: [[Sequelize.col("patient_contact_number"), "Contact"]],
    include: [
      {
        model: model.patient,
        attributes: [],
      },
    ],
    where: {
      appointment_ID: ID,
    },
  });
};
exports.updateProfile = async function (params) {
  await model.doctor_Secretary.update(
    {
      doctor_Secretary_first_name: params.Fname,
      doctor_Secretary_middle_name: params.Mname,
      doctor_Secretary_last_name: params.Lname,
    },
    {
      where: {
        doctor_Secretary_ID: params.ID,
      },
    }
  );
};

exports.getAppointmentsToday = async function (doctor_ID, date) {
  return await model.appointmentDetails.findAll({
    raw: true,
    attributes: [
      [Sequelize.col("patient_first_name"), "Fname"],
      [Sequelize.col("patient_last_name"), "Lname"],
      [Sequelize.col("patient_contact_number"), "Contact"],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%M %e, %Y"
        ),
        "appointmentDate",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_start_time"),
          "%h:%i%p"
        ),
        "start",
      ],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_end_time"),
          "%h:%i%p"
        ),
        "end",
      ],
    ],

    include: [
      {
        model: model.patient,
        attributes: [],
      },
      {
        model: model.doctor_schedule_table,
        attributes: [],
        where: {
          doctor_schedule_date: date,
        },
      },
    ],
    where: [
      {
        doctor_ID: doctor_ID,
        appointment_status: "Confirmed",
      },
    ],
  });
};

exports.get_SetAppointment = async function (date, doctor_ID) {
  return await model.doctor_schedule_table.findOne({
    raw: true,
    where: {
      doctor_ID: doctor_ID,
      doctor_schedule_date: date,
    },
  });
};

exports.getAvailableScheduleForUpdate = async function (doctor_ID) {
  return await model.doctor_schedule_table.findAll({
    raw: true,
    attributes: [
      "doctor_ID",
      [Sequelize.col("doctor_schedule_max_patient"), "maxPatient"],
      [Sequelize.col("doctor_schedule_Interval"), "timeInterval"],
      [
        Sequelize.fn(
          "date_format",
          Sequelize.col("doctor_schedule_date"),
          "%Y-%m-%d"
        ),
        "date",
      ],
      [Sequelize.col("doctor_schedule_start_time"), "start"],
      [Sequelize.col("doctor_schedule_end_time"), "end"],
    ],
    where: {
      doctor_ID,
      doctor_schedule_current_queue: 1,
    },
  });
};

exports.updateDoctorAvailability = async function (updatedModel) {
  return await model.doctor_schedule_table.update(
    {
      doctor_schedule_start_time: updatedModel.startTime,
      doctor_schedule_end_time: updatedModel.endTime,
      doctor_schedule_Interval: updatedModel.intervalTime,
      doctor_schedule_max_patient: updatedModel.maxPatient,
    },
    {
      where: {
        doctor_schedule_ID: updatedModel.schedule_ID,
      },
    }
  );
};

// exports.fetchDoctorPatientAppointments = async function (
//   doctor_ID,
//   startOfWhat,
//   endOfWhat
// ) {
//   return await model.appointmentDetails.findAll({
//     raw: true,
//     attributes: [
//       "appointment_ID",
//       "patient_ID",
//       [Sequelize.col("patient_first_name"), "patient_Fname"],
//       [Sequelize.col("patient_last_name"), "patient_Lname"],
//       [Sequelize.col("patient_gender"), "gender"],
//       [patient_age, "age"],
//       [Sequelize.col("patient_contact_number"), "contact"],
//       [Sequelize.col("user_email"), "email"],
//       [Sequelize.col("doctor_first_name"), "doctor_Fname"],
//       [Sequelize.col("doctor_last_name"), "doctor_Lname"],
//       [Sequelize.col("doctor_first_name"), "doctor_Fname"],
//       [Sequelize.col("specialization_Name"), "specialization"],
//       [
//         Sequelize.fn(
//           "date_format",
//           Sequelize.col("appointment_start"),
//           "%h:%i%p"
//         ),
//         "start",
//       ],
//       [
//         Sequelize.fn(
//           "date_format",
//           Sequelize.col("doctor_schedule_end_time"),
//           "%h:%i%p"
//         ),
//         "end",
//       ],
//       [
//         Sequelize.fn(
//           "date_format",
//           Sequelize.col("doctor_schedule_date"),
//           "%M %e, %Y"
//         ),
//         "modalDate",
//       ],
//       [
//         Sequelize.fn(
//           "date_format",
//           Sequelize.col("doctor_schedule_date"),
//           "%m/%d/%Y"
//         ),
//         "appointmentDate",
//       ],
//       ["appointment_status", "status"],
//     ],
//     include: [
//       {
//         model: model.doctor,
//         attributes: [],
//         include: [
//           {
//             model: model.doctor_specialization,
//             attributes: [],
//           },
//         ],
//       },
//       {
//         model: model.patient,
//         attributes: [],
//         required: true,
//         include: [
//           {
//             model: model.user,
//             attributes: [],
//           },
//         ],
//       },
//       {
//         model: model.doctor_schedule_table,
//         attributes: [],
//       },
//     ],
//     where: {
//       doctor_ID: doctor_ID,
//       createdAt: {
//         [Sequelize.Op.between]: [startOfWhat, endOfWhat],
//       },
//     },
//   });
// };
