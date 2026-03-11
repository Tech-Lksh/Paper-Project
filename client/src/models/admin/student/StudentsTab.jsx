import React from "react";

const StudentsTab = () => {

  const students = [];

  return (
    <div className="grid grid-cols-3 gap-6">

      {students.map((student) => (

        <div key={student._id} className="bg-white p-4 rounded shadow">

          <img
            src={`http://localhost:5000/uploads/profile/${student.profileImage}`}
            className="w-20 h-20 rounded-full mx-auto"
          />

          <h3 className="text-center font-bold mt-2">{student.name}</h3>

          <div className="flex justify-center gap-2 mt-3">

            <button className="bg-green-500 text-white px-3 py-1 rounded">
              Grant
            </button>

            <button className="bg-red-500 text-white px-3 py-1 rounded">
              Reject
            </button>

            <button className="bg-gray-500 text-white px-3 py-1 rounded">
              Ungrant
            </button>

          </div>

        </div>

      ))}

    </div>
  );
};

export default StudentsTab;