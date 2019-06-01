class LazyLoad {
  constructor(imgs) {
    this.images = [];
    for(let i = 0;i < imgs.length; ++i) {
      this.images[i] = {
        hasLoad: false,
        img: imgs[i]
      };
    }
    // 这里建议结合节流函数
    document.addEventListener('scroll', () => {
      for(let i = 0;i < this.images.length; ++i) {
        if(this.images[i].hasLoad) continue;
        let { top } = this.images[i].img.getBoundingClientRect();
        if(top <= window.innerHeight) {
          this.images[i].hasLoad = true;
          this.images[i].img.src = this.images[i].img.dataset.src;
          this.images[i].img = null; 
        }
      }
    });
  }
}

let imgs = document.querySelectorAll('img');
new LazyLoad(imgs);