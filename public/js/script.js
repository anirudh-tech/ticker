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


        $("#showPasswordTwo").click(function(){
            var passwordField = $("#confirmPassword");
            var fieldType = passwordField.attr("type");
            if(fieldType === "password"){
                passwordField.attr("type","text");
            }else{
                passwordField.attr("type","password")
            }
        });


        $('#signupForm').on('submit', function(event) {
            event.preventDefault();
            window.location.href = "/emailVerification";
        });

        $('#loginForm').on('submit',function(event){
            event.preventDefault()
            window.location.href = "/homepage"
        })

        $('#emailVerification').on('click',function(event){
            event.preventDefault()
            window.location.href = "/homepage"
        })

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
    });

    
// ----------------------------------------------------------------------

// function redirectToEmailVerification(){
//     window.location.href = 'user/emailVerification'
// }


  

