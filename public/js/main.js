$ (function (){
    //Used in admin add product
    ClassicEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => {
            console.error( error );
        });

        $('a.confirmDeletion').on('click', function () {
            if (!confirm('Are you sure you want to delete?'))
                return false;
        });

        if($("[data-fancybox]").length) {
            $("[data-fancybox]").fancybox();
        }; 
        
        // const Success = document.getElementById("error_display");
        // setTimeout(function(){Success.style.display = 'none'}, 4000);   
})