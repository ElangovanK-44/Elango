function c(e){const t=document.getElementById(e),o=t.textContent||t.innerText;navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(o).then(()=>{r("Copied to clipboard!")}).catch(n=>{s(o)}):s(o)}function s(e){const t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.left="-9999px",document.body.appendChild(t),t.select();try{document.execCommand("copy"),r("Copied to clipboard!")}catch{r("Failed to copy","error")}document.body.removeChild(t)}function r(e,t="success"){const o=document.querySelector(".toast");o&&o.remove();const n=document.createElement("div");n.className="toast",n.textContent=e,n.style.cssText=`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${t==="success"?"#10B981":"#EF4444"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `,document.body.appendChild(n),setTimeout(()=>{n.style.animation="slideOut 0.3s ease",setTimeout(()=>n.remove(),300)},3e3)}const a=document.createElement("style");a.textContent=`
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;document.head.appendChild(a);function i(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function d(e){return/^[6-9]\d{9}$/.test(e.replace(/\s+/g,""))}function l(e){return e.length>=6}function m(e,t){const o=document.getElementById(e);o&&(o.textContent=t,o.style.display="block")}function u(e){const t=document.getElementById(e);t&&(t.style.display="none")}function p(e,t){const o=document.getElementById(e);o&&(o.textContent=t,o.style.display="block")}function y(e){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(e)}window.copyToClipboard=c;export{i as a,l as b,p as c,r as d,y as f,u as h,m as s,d as v};
