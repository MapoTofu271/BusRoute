//why make Router an object
class Router {
    constructor() {
        this.routes = []
        this.currentRoute = null;
        //this.mainContent = document.getElementById('main-content');
        
        this.init();
    }

    init() {
        /* 
        Add event lister or link clicks
        
        what the target mean?
        e.preventDefault()?
        this.navigate?
        */
       document.addEventListener('click', (e) => {
            /*
            if(e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href').replace('#', ''))
            }
        
            */
       });

       /*
       Handle browser back/forward
       popstate?
       hanleRouteChange?
       window.location.pathname is already initialized?
       */
       window.addEventListener('popstate', (e) => {
            this.handleRouteChane(window.location.pathname)
        });
        
        //inital route
        this.handleRouteChange(window.location.pathname || '/');
    }
    
    

}