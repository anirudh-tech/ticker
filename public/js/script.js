//show eye in password in user signup
    $(document).ready(function () {
        $("#showPasswordOne").click(function () {
            var passwordField = $("#password");
            var fieldType = passwordField.attr("type");
            
            if (fieldType === "password") {
                passwordField.attr("type", "text");
            } else {
                passwordField.attr("type", "password");
            }
        });


        // $("#showPasswordTwo").click(function(){
        //     var passwordField = $("#confirmPassword");
        //     var fieldType = passwordField.attr("type");
        //     if(fieldType === "password"){
        //         passwordField.attr("type","text");
        //     }else{
        //         passwordField.attr("type","password")
        //     }
        // });
        // $("#showPasswordOne").click(function () {
        //     var passwordInput = $("#password");
        //     if (passwordInput.attr("type") === "password") {
        //         passwordInput.attr("type", "text");
        //     } else {
        //         passwordInput.attr("type", "password");
        //     }
        // });
    
        $("#showPasswordTwo").click(function () {
            var confirmPasswordInput = $("#confirmPassword");
            if (confirmPasswordInput.attr("type") === "password") {
                confirmPasswordInput.attr("type", "text");
            } else {
                confirmPasswordInput.attr("type", "password");
            }
        });
    
        $("#password, #confirmPassword").on("keyup", function () {
            var password = $("#password").val();
            var confirmPassword = $("#confirmPassword").val();
    
            if (password === confirmPassword) {
                $("#password, #confirmPassword").removeClass("is-invalid");
            } else {
                $("#password, #confirmPassword").addClass("is-invalid");
            }
        });


        // $('#signupForm').on('submit', function(event) {
        //     event.preventDefault();
        //     window.location.href = "/emailVerification";
        // });

        // $('#loginForm').on('submit',function(event){
        //     event.preventDefault()
        //     window.location.href = "/homepage"
        // })

        // $('#emailVerification').on('click',function(event){
        //     event.preventDefault()
        //     window.location.href = "/homepage"
        // })

        const minusBtn = $('#minusBtn');
        const plusBtn = $('#plusBtn');
        const countInput = $('#count');

        // Initial count value
        let count = 0;

        minusBtn.on('click', function () {
            if (count > 0) {
                count--;
                countInput.val(count);
            }
        });

        plusBtn.on('click', function () {
            count++;
            countInput.val(count);
        });

        $('#addProduct').on('click',function(event){
            event.preventDefault()
            window.location.href = "/admin/addproduct"
        })
        
        $('input[name="productType"]').change(function () {
            if ($(this).val() === 'watches') {
                $('#watchColorInput').show();
                $('#perfumeQuantityDropdown').hide();
            } else if ($(this).val() === 'perfumes') {
                $('#perfumeQuantityDropdown').show();
                $('#watchColorInput').hide();
            } else {
                // Handle other cases if needed
                $('#watchColorInput').hide();
                $('#perfumeQuantityDropdown').hide();
            }
        });

            const fileInput = $('#productImage');
            const uploadedImages = [
                $('#uploadedImage1'),
                $('#uploadedImage2'),
                $('#uploadedImage3')
            ];
        
            fileInput.change(function () {
                const files = fileInput[0].files;
        
                // Show delete buttons for uploaded images
                for (let i = 0; i < uploadedImages.length; i++) {
                    if (i < files.length) {
                        const file = files[i];
                        const reader = new FileReader();
        
                        reader.onload = function (e) {
                            // Set the src attribute of the corresponding <img> element
                            uploadedImages[i].attr('src', e.target.result);
                        };
        
                        reader.readAsDataURL(file);
        
                        // Show the delete button
                        $('.delete-image[data-index="' + (i + 1) + '"]').show();
                    } else {
                        uploadedImages[i].attr('src', ''); // Clear the src attribute
                        // Hide the delete button
                        $('.delete-image[data-index="' + (i + 1) + '"]').hide();
                    }
                }
            });
            // Add event listener to the "Delete" buttons
            $('.delete-image').click(function () {
                const index = $(this).data('index');
                uploadedImages[index - 1].attr('src', ''); // Clear the image
                fileInput.val(''); // Clear the file input
                // Hide the delete button
                $(this).hide();
            });


       
        });
        

    
// ----------------------------------------------------------------------

// function redirectToEmailVerification(){
//     window.location.href = 'user/emailVerification'
// }


  

