let swiper = [];
let imgList;
function getSlideElementList(path, imgList, dotted, size){
    var innerHTML = `<div class="swiper-wrapper">`;
    imgList.forEach(imgName =>
        innerHTML +=
        `<div class="swiper-slide">
            <img src="/assets` + path + `/` + imgName + `" style="width:` + size + `; min-width: 300px" class="swiper-lazy">
            <div class="swiper-lazy-preloader"></div>
        </div>`
    )
    innerHTML += `</div>`;
    if(dotted) innerHTML += `<div class="swiper-pagination"></div>`
    innerHTML += `<div class="swiper-button-next"></div>`
    innerHTML += `<div class="swiper-button-prev"></div>`

    return innerHTML;
}

function swiperInitialize(container_id, props){
    document.getElementById(container_id).innerHTML = getSlideElementList(props.path, props.imgList, props.dotted, props.size);

    swiper.push(new Swiper("#" + container_id, {
        spaceBetween: 30,
        centeredSlides: true,
        autoplay: {
          delay: props.millis,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        lazy: {
          loadPrevNext: true
        }
      }));
}

function slideTo(n, speed = 300){
    swiper.slideTo(n, speed);
}
