export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              PlantShop
            </h3>
            <p className="text-gray-400">
              Your one-stop shop for beautiful plants to enhance your living space.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/plants" className="hover:text-white transition-colors">All Plants</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/plants?category=Indoor" className="hover:text-white transition-colors">Indoor Plants</a></li>
              <li><a href="/plants?category=Outdoor" className="hover:text-white transition-colors">Outdoor Plants</a></li>
              <li><a href="/plants?category=Succulent" className="hover:text-white transition-colors">Succulents</a></li>
              <li><a href="/plants?category=Flowering" className="hover:text-white transition-colors">Flowering Plants</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@plantshop.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Green Street</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PlantShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

