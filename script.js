const products = [
  {id:'roll', name:'Bio-Leather Material Roll', tag:'B2B · Material', price:550000, unit:'/ m²', image:'assets/bio_leather_roll.jpg', desc:'Coffee-ground bio-composite material for fashion accessories and selected light applications.'},
  {id:'pouch', name:'Cosmetic Pouch / Clutch', tag:'B2C · Accessory', price:490000, unit:'', image:'assets/cosmetic_pouch.jpg', desc:'22 × 14 × 6 cm with bio-leather exterior, natural cotton/canvas lining and metal zipper.'},
  {id:'passport', name:'Passport Wallet', tag:'B2C · Accessory', price:250000, unit:'', image:'assets/passport_wallet.jpg', desc:'Folded 14.5 × 10.5 cm travel wallet with a compact, lightweight structure.'},
  {id:'card', name:'Minimalist Card Holder', tag:'B2C · Accessory', price:220000, unit:'', image:'assets/card_holder.jpg', desc:'10 × 7 cm, four card slots and one central compartment, precision-cut with CO₂ laser technology.'},
  {id:'charm', name:'CAFÉLIA Brand Charm', tag:'B2C · Zero-waste', price:150000, unit:'', image:'assets/brand_charm.jpg', desc:'A small accessory made from qualified bio-leather offcuts generated during pattern cutting.'}
];

const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutSummary = document.getElementById('checkoutSummary');
let cart = JSON.parse(localStorage.getItem('cafelia-cart') || '[]');

const fmt = n => new Intl.NumberFormat('en-US').format(n);

function renderProducts(){
  productGrid.innerHTML = products.map((p, i) => `
    <article class="product-card">
      <button class="image-button product-media" data-lightbox="${p.image}" aria-label="View ${p.name}">
        <img src="${p.image}" alt="${p.name}">
      </button>
      <div class="product-info">
        <div class="product-tag">${p.tag}</div>
        <div class="product-title">${p.name}</div>
        <p class="product-desc">${p.desc}</p>
        <div class="product-bottom">
          <div class="price-panel"><span>Indicative price</span><strong>VND ${fmt(p.price)} ${p.unit}</strong></div>
          <button class="buy-btn" data-add="${p.id}">+ Add to cart</button>
        </div>
      </div>
    </article>`).join('');
}

function saveCart(){localStorage.setItem('cafelia-cart', JSON.stringify(cart));}
function cartTotal(){return cart.reduce((s,item)=>s + item.price * item.qty,0)}
function openCart(){cartDrawer.classList.add('open'); drawerBackdrop.classList.add('show'); cartDrawer.setAttribute('aria-hidden','false');}
function closeCart(){cartDrawer.classList.remove('open'); drawerBackdrop.classList.remove('show'); cartDrawer.setAttribute('aria-hidden','true');}
function addToCart(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  const existing=cart.find(x=>x.id===id);
  existing ? existing.qty++ : cart.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:1});
  saveCart(); renderCart(); openCart();
}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id); if(!item) return;
  item.qty+=delta; if(item.qty<=0) cart=cart.filter(x=>x.id!==id);
  saveCart(); renderCart();
}
function renderCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0); cartCountEl.textContent=count;
  cartTotalEl.textContent=`VND ${fmt(cartTotal())}`;
  if(!cart.length){cartItemsEl.innerHTML='<div style="padding:50px 5px;color:#777;font-size:13px;text-align:center">Your cart is empty.<br><br>Select a piece from the collection to begin.</div>';return;}
  cartItemsEl.innerHTML=cart.map(item=>`<div class="cart-item">
    <img src="${item.image}" alt="${item.name}">
    <div><h4>${item.name}</h4><p>VND ${fmt(item.price)}</p><div class="qty"><button data-minus="${item.id}">−</button><strong>${item.qty}</strong><button data-plus="${item.id}">+</button></div></div>
    <button class="icon-btn" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
  </div>`).join('');
}

function buildCheckoutSummary(){
  checkoutSummary.innerHTML = cart.length ? cart.map(i=>`<div style="display:flex;justify-content:space-between;margin:5px 0"><span>${i.qty} × ${i.name}</span><strong>VND ${fmt(i.price*i.qty)}</strong></div>`).join('') + `<hr style="border:0;border-top:1px solid rgba(24,34,29,.13)"><div style="display:flex;justify-content:space-between"><span>Total</span><strong>VND ${fmt(cartTotal())}</strong></div>` : 'Your cart is empty.';
}

document.addEventListener('click', e=>{
  const add=e.target.closest('[data-add]'); if(add){addToCart(add.dataset.add); return;}
  const plus=e.target.closest('[data-plus]'); if(plus){changeQty(plus.dataset.plus,1); return;}
  const minus=e.target.closest('[data-minus]'); if(minus){changeQty(minus.dataset.minus,-1); return;}
  const remove=e.target.closest('[data-remove]'); if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove); saveCart(); renderCart(); return;}
  const lb=e.target.closest('[data-lightbox]'); if(lb){document.getElementById('lightboxImage').src=lb.dataset.lightbox; document.getElementById('lightbox').classList.add('open'); return;}
});

document.getElementById('openCart').addEventListener('click',openCart);
document.getElementById('closeCart').addEventListener('click',closeCart);
drawerBackdrop.addEventListener('click',closeCart);
document.getElementById('checkoutBtn').addEventListener('click',()=>{if(!cart.length){alert('Your cart is empty.'); return;} buildCheckoutSummary(); checkoutModal.showModal();});
document.getElementById('closeCheckout').addEventListener('click',()=>checkoutModal.close());
document.getElementById('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget); const order='CF-'+Date.now().toString().slice(-7);
  checkoutSummary.innerHTML=`<div style="padding:18px 0"><strong>Order ${order}</strong><p style="margin:7px 0 0;color:#666">Thank you, ${data.get('name')}. Your demo order has been recorded locally in this browser. For an academic project, the next step would be connecting this checkout to a real payment and order backend.</p></div>`;
  cart=[]; saveCart(); renderCart();
  e.currentTarget.querySelector('button[type="submit"]').textContent='Order received';
  setTimeout(()=>{checkoutModal.close(); closeCart();},1800);
});

document.getElementById('lightboxClose').addEventListener('click',()=>document.getElementById('lightbox').classList.remove('open'));
document.getElementById('lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox') document.getElementById('lightbox').classList.remove('open')});

window.addEventListener('scroll',()=>document.querySelector('.site-header').classList.toggle('scrolled',window.scrollY>60));
renderProducts(); renderCart();
