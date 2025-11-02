$('.sms-form').on('submit', function (event) {
    let orderSum = $('#cart-total').text().trim();

    // Собираем список товаров из корзины
    let orderItems = [];
    $('#cart-items li').each(function() {
        let text = $(this).text().trim();
        // Убираем лишние символы, оставляем только буквы, цифры и пробел
        text = text.replace(/[^\w\sА-Яа-яЁё.,-]/g, '');
        if(text) orderItems.push(text.substring(0, 70)); // ограничиваем до 40 символов
    });
    
    // Записываем их в скрытые поля формы
    $('#OrderSum').val(orderSum);
    $('#OrderItems').val(orderItems.join(', '));
    event.stopPropagation();
    event.preventDefault();

    let form = this,
        submit = $('.submit', form),
        data = new FormData(),
        files = $('input[type=file]')


    $('.submit', form).val('Отправка...');
    $('input, textarea', form).attr('disabled','');

    data.append( 'name', 		$('[name="name"]', form).val() );
    data.append( 'phone', 		$('[name="phone"]', form).val() );
    data.append( 'social-media', 		$('[name="social-media"]', form).val() );

    data.append('OrderSum', $('#OrderSum').val());
    data.append('OrderItems', $('#OrderItems').val());

    files.each(function (key, file) {
        let cont = file.files;
        if ( cont ) {
            $.each( cont, function( key, value ) {
                data.append( key, value );
            });
        }
    });
    
    $.ajax({
        url: './PHP/ajax.php',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        xhr: function() {
            let myXhr = $.ajaxSettings.xhr();

            if ( myXhr.upload ) {
                myXhr.upload.addEventListener( 'progress', function(e) {
                    if ( e.lengthComputable ) {
                        let percentage = ( e.loaded / e.total ) * 100;
                            percentage = percentage.toFixed(0);
                        $('.submit', form)
                            .html( percentage + '%' );
                    }
                }, false );
            }

            return myXhr;
        },
        error: function( jqXHR, textStatus ) {
            // Тут выводим ошибку
        },
        complete: function() {
            // Тут можем что-то делать ПОСЛЕ успешной отправки формы
            console.log('Complete')
            form.reset() 
        }
    });

    return false;
});
