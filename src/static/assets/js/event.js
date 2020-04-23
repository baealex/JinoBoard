$('#id_avatar').on('change',function() {
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
});

$('#id_image').on('change', function() {
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
});

$('.gp').on('click', function() {
    location.href='?page=' + $('.pn').val();
});

$('.pn').on('submit', function() {
    location.href='?page=' + $('.pn').val();
});

$('#idButton').on('click', function() {
    if($('#id_username').val() != '') {
        $.ajax({
            url: '/signup/help/id',
            type: 'POST',
            data: { 'id': $('#id_username').val() },
        }).done(function(data) {
            $('#idCheck').addClass('alert');
            if(data == 'ERROR:OL') {
                $('#idCheck').removeClass('alert-success');
                $('#idCheck').addClass('alert-danger');
                $('#idCheck').text('이미 사용중인 필명입니다!');
                if(document.getElementById('idButton')) {
                    var idButton = $('#idButton');
                    idButton.text('아이디 확인');
                    idButton.prop('type', 'button');
                }
            } else if(data == 'ERROR:NM') {
                $('#idCheck').removeClass('alert-success');
                $('#idCheck').addClass('alert-danger');
                $('#idCheck').text('소문자와 숫자로만 구성할 수 있습니다!');
                if(document.getElementById('idButton')) {
                    var idButton = $('#idButton');
                    idButton.text('아이디 확인');
                    idButton.prop('type', 'button');
                }
            } else {
                $('#idCheck').removeClass('alert-danger');
                $('#idCheck').addClass('alert-success');
                $('#idCheck').text(window.location.protocol + '//' + window.location.hostname + '/@' + $('#id_username').val());
                if(document.getElementById('idButton')) {
                    var idButton = $('#idButton');
                    idButton.text('아이디 사용');
                    idButton.prop('type', 'submit');
                    $('#id_username').on('propertychange change keyup paste input', function() {
                        var idButton = $('#idButton');
                        idButton.text('아이디 확인');
                        idButton.prop('type', 'button');
                    });
                }
            }
        });
    }
});

$('#signup input').on('focusout', function(){
    if($('#id_username').val() != '') {
        $.ajax({
            url: '/signup/help/id',
            type: 'POST',
            data: { 'id': $('#id_username').val() },
        }).done(function(data) {
            $('#idCheck').addClass('alert');
            if(data == 'ERROR:OL') {
                $('#idCheck').removeClass('alert-success');
                $('#idCheck').addClass('alert-danger');
                $('#idCheck').text('이미 사용중인 필명입니다!');
            } else if(data == 'ERROR:NM') {
                $('#idCheck').removeClass('alert-success');
                $('#idCheck').addClass('alert-danger');
                $('#idCheck').text('소문자와 숫자로만 구성할 수 있습니다!');
            } else {
                $('#idCheck').removeClass('alert-danger');
                $('#idCheck').addClass('alert-success');
                $('#idCheck').text(window.location.protocol + '//' + window.location.hostname + '/@' + $('#id_username').val());
                if(document.getElementById('idButton')) {
                    var idButton = $('#idButton');
                    idButton.text('완료');
                    idButton.prop('type', 'submit');
                }
            }
        });
    }
});

$('#github-login').on('click', function() {
    var url = '';
    url += 'https://github.com/login/oauth/authorize';
    url += '?client_id=c5b001b86e3e77f2af1f';
    url += '&redirect_uri=' + window.location.protocol + '//' + window.location.hostname + '/login/callback/github';
    location.href = url;
});

$('#google-login').on('click', function() {
    var url = '';
    url += 'https://accounts.google.com/o/oauth2/auth';
    url += '?client_id=230716131865-ann8gcfd9b3oq3d6funkkb5r8k1d9d3o.apps.googleusercontent.com';
    url += '&redirect_uri=' + window.location.protocol + '//' + window.location.hostname + '/login/callback/google';
    url += '&response_type=code';
    url += '&scope=openid profile email'
    url += '&approval_prompt=force'
    url += '&access_type=offline'
    location.href = url;
});

$('.story-read').on('click', function() {
    var href = $(this).data('href');
    $('#content').load(href + ' #content', function() {
        $('#content img,#content source').each(function(index, item) {
            $(item).attr('src', $(item).data('src'));
        });
    });
    history.pushState({}, href, href);
    $('.story-read').each(function(index, item) {
        $(item).removeClass('active');
    })
    $(this).addClass('active');
    if($(window).width() < 1500) {
        $('.closer').html('<i class="fas fa-chevron-right"></i>');
        $('.closer').addClass('closed');
        $('.thread-sidebar').addClass('closed');
        $('.home').removeClass('closed');
    }
});

$('.closer').on('click', function() {
    if($('.closer').hasClass('closed')) {
        $('.closer').html('<i class="fas fa-chevron-left"></i>');
        $('.closer').removeClass('closed');
        $('.thread-sidebar').removeClass('closed');
    } else {
        $('.closer').html('<i class="fas fa-chevron-right"></i>');
        $('.closer').addClass('closed');
        $('.thread-sidebar').addClass('closed');
    }
    if($(window).width() < 460) {
        if($('.home').hasClass('closed')) {
            $('.home').removeClass('closed');
        } else {
            $('.home').addClass('closed');
        }
    }
});

$('.home').on('click', function() {
    location.href = '/';
});

$('.thread-reverse').on('click', function() {
    var reverse = $(this).data('reverse');
    if(reverse) {
        $('#thread').addClass('reverse');
    } else {
        $('#thread').removeClass('reverse');
    }
    $('.selection .thread-reverse').each(function(index, item) {
        $(item).removeClass('active');
    });
    $(this).addClass('active');
});

(function() {
    var writeSeletor = '';
    var writeRender = function() {
        $('#write-selector').html(Render.write(writeSeletor.result));
        $('.write-closer').on('click', function() {
            $('#write-selector').html('');
        });
    }
    $('#write-btn').on('click', function() {
        if(writeSeletor == '') {
            $.ajax({
                url: '/api/v1/posts/temp',
                type: 'GET',
                data: { get: 'list'} ,
            }).done(function (data) {
                writeSeletor = data
                writeRender();
            });
        }
        else {
            writeRender();
        }
    });
})();

document.addEventListener("DOMContentLoaded", function() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  
    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
  
        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Possibly fall back to a more compatible method here
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));
  
    if ("IntersectionObserver" in window) {
        var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(video) {
                if (video.isIntersecting) {
                    for (var source in video.target.children) {
                        var videoSource = video.target.children[source];
                        if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                            videoSource.src = videoSource.dataset.src;
                        }
                    }
  
                    video.target.load();
                    video.target.classList.remove("lazy");
                    lazyVideoObserver.unobserve(video.target);
                }
            });
        });
  
        lazyVideos.forEach(function(lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    }
});