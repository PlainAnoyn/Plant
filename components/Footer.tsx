export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-200 dark:text-slate-300 mt-16 border-t border-slate-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="mr-2">🌱</span>
              PlantShop
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your one-stop shop for beautiful plants to enhance your living space.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wide text-slate-300 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/" className="hover:text-slate-200 transition-colors">Home</a></li>
              <li><a href="/plants" className="hover:text-slate-200 transition-colors">All Plants</a></li>
              <li><a href="/about" className="hover:text-slate-200 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-slate-200 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wide text-slate-300 mb-3">Categories</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/plants?category=Indoor" className="hover:text-slate-200 transition-colors">Indoor Plants</a></li>
              <li><a href="/plants?category=Outdoor" className="hover:text-slate-200 transition-colors">Outdoor Plants</a></li>
              <li><a href="/plants?category=Succulent" className="hover:text-slate-200 transition-colors">Succulents</a></li>
              <li><a href="/plants?category=Flowering" className="hover:text-slate-200 transition-colors">Flowering Plants</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wide text-slate-300 mb-3">Contact Info</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Email: info@plantshop.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Green Street</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PlantShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

