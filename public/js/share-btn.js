// const shareBtn = document.querySelector('.share-btn');
// const shareOptions = document.querySelector('.share-options');

// shareBtn.addEventListener('click', () => {
//     shareOptions.classList.toggle('active');
// })

const link = encodeURI(window.location.href);
// const link = 'https://www.jumia.com.ng/fanta-drink-35cl-pet-x-12-81076431.html';
const msg = encodeURIComponent('Hey, check this product out');
const title = encodeURIComponent(document.querySelector('title').textContent);

// console.log([link, msg, title]);

const fb = document.querySelector('.facebook');
fb.href = `https://www.facebook.com/share.php?u=${link}`;

const twitter = document.querySelector('.twitter');
//twitter.href = `http://twitter.com/share?&url=${link}&text=${msg}`;
twitter.href = `https://twitter.com/intent/tweet?&url=${link}`;
                // http://twitter.com/share?&url={}&text={}&hashtags=javascript,programming

const whatsapp = document.querySelector('.whatsapp');
// whatsapp.href = `https://wa.me/?text=${link}`;
whatsapp.href = `https://api.whatsapp.com/send?text=${link}`;