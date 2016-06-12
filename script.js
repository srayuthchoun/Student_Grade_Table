$(function ($) { // jQuery shorthand for document ready

    /** Create Operations **/
    var submitBtn = $('#add-student-btn'),
        sgtTableElement = $('#student-table'),
        //FirebaseRef is referenced to the database.
        firebaseRef = new Firebase("https://fiery-fire-3460.firebaseio.com/students");

    // Submit button click handler that gets the values from the add student form
    submitBtn.click(function () {
        var studentName = $('#s-name-input').val(),
            studentCourse = $('#s-course-input').val(),
            studentGrade = $('#s-grade-input').val();


        // Send the values to firebase database. firebaseRef.push will append a new item to the user list
        if ((studentName !== '') && (studentCourse !== '') && (studentGrade !== '')) {
        firebaseRef.push({
            name: studentName,
            course: studentCourse,
            grade: studentGrade

        });
    }
        clearInputs();
    });

    //Cancel button to clear inputs in add student form
    $('#cancel-btn').click(function(){
        clearInputs();
    });


    /** Read Operations **/

    /** Asynchronous callback to read the data at firebaseRef on load
     * child_added will update the DOM every time a new student is added to the database
     */
    firebaseRef.on("child_added", function (studentSnapShot) {
        updateDOM(studentSnapShot);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    firebaseRef.on("child_changed", function (studentSnapShot) {
        updateDOM(studentSnapShot);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


    /** Update Operations **/

    /** Edit button handler
     * Click handlers ensures that every new student row that is added to the DOM will inherit an operational edit button
     */
    sgtTableElement.on('click', '.edit-btn', function () {
        var student_id = $(this).data('id');
        var studentFirebaseRef = firebaseRef.child(student_id);
        console.log("firebaseref.child" + firebaseRef.child(student_id));

        /** Once method method will listen for an event only once and use it to pre-fill the inputs in the form for a
         * better user experience
         */
        studentFirebaseRef.once('value', function (snapshot) {
            $('#modal-edit-name').val(snapshot.val().name);
            $('#modal-edit-course').val(snapshot.val().course);
            $('#modal-edit-grade').val(snapshot.val().grade);

            $('#student-id').val(student_id);

            console.log("$('#student-id').val(student_id) : ", $('#student-id').val(student_id));

            $("#edit-modal").modal("show");
        });
    });

    /** Edit Student Function
     * studentFirebaseReference argument is the unique url of the selected student in the firebase database
     * Function takes an argument of the firebase reference of the student to be edited when the #confirm-edit button
     * is clicked
     */
    function studentEdit(studentFirebaseReference) {
        var newName = $('#modal-edit-name').val(),
            newCourse = $('#modal-edit-course').val(),
            newGrade = $('#modal-edit-grade').val();
        console.log('student updated', 'newName: ', newName, 'newCourse: ', newCourse, 'newGrade: ', newGrade);
        // Sends the new student values to firebase to be updated
        studentFirebaseReference.update({
            name: newName,
            course: newCourse,
            grade: newGrade
        });
    }

    // Click handler for modal confirm button
    $("#edit-modal").on('click', '#confirm-edit', function () {
        console.log("('#edit-modal').find('#student-id').val() :", $('#edit-modal').find('#student-id').val());
        var studentFirebaseRef = firebaseRef.child($('#edit-modal').find('#student-id').val());
        // Sends the correct variable into the student edit function
        studentEdit(studentFirebaseRef);
        $("#edit-modal").modal('hide');
    });

    /** Delete Operations **/

    // Delete button handler
    sgtTableElement.on('click', '.delete-btn', function () {
        var studentFirebaseRef = firebaseRef.child($(this).data('id'));
        console.log('this on delete-btn is: ' + $(this).data('id'));
        firebaseRef.on('child_removed', function (snapshot) {
            // Remove the element from the DOM
            console.log('snapshot.key is: ', snapshot.key());
            var rowId = snapshot.key();
            $('#' + rowId).remove();
        });

        // Delete the student with the firebase method
        studentFirebaseRef.remove();
    });

    // Clear out inputs in the add-student-form
    function clearInputs() {
        $('#s-name-input').val('');
        $('#s-course-input').val('');
        $('#s-grade-input').val('');
    }

    /** Dom Creation **/
    function updateDOM(studentSnapShot) {
        var studentObject = studentSnapShot.val();
        var studentObjectId = studentSnapShot.key();
        var studentRow = $("#" + studentObjectId);
        if (studentRow.length > 0) {
            //change current
            studentRow.find(".student-name").text(studentObject.name);
            studentRow.find(".student-course").text(studentObject.course);
            studentRow.find(".student-grade").text(studentObject.grade);
        } else {
            //add new
            var sName = $('<td>', {
                    text: studentObject.name,
                    class: "student-name"
                }),
                sCourse = $('<td>', {
                    text: studentObject.course,
                    class: "student-course"
                }),
                sGrade = $('<td>', {
                    text: studentObject.grade,
                    class: "student-grade"
                }),
            //Each student gets a unique edit and delete button appended to its row
                sEditBtn = $('<button>', {
                    class: "btn btn-info edit-btn",
                    'data-id': studentObjectId
                }),
                sEditBtnIcon = $('<span>', {
                    class: "glyphicon glyphicon-pencil"
                }),
                sDeleteBtn = $('<button>', {
                    class: "btn btn-danger delete-btn",
                    'data-id': studentObjectId
                }),
                sDeleteBtnIcon = $('<span>', {
                    class: "glyphicon glyphicon-trash"
                });

            studentRow = $('<tr>', {
                id: studentObjectId
            });
            sEditBtn.append(sEditBtnIcon);
            sDeleteBtn.append(sDeleteBtnIcon);
            studentRow.append(sName, sCourse, sGrade, sEditBtn, sDeleteBtn);
            sgtTableElement.append(studentRow);
        }
    }
});