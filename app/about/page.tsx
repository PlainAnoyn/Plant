export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About PlantShop</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to PlantShop, your one-stop destination for beautiful plants that bring life 
              and freshness to your home and garden. We believe that everyone deserves to have 
              access to high-quality plants that can transform any space.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Our mission is to make plant shopping easy, enjoyable, and accessible to everyone. 
              We carefully select each plant in our collection to ensure you receive healthy, 
              vibrant plants that will thrive in your care.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Wide variety of indoor and outdoor plants</li>
              <li>Detailed care instructions for each plant</li>
              <li>Healthy, well-maintained plants ready for your home</li>
              <li>Expert advice and support</li>
              <li>Competitive prices and great value</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Commitment</h2>
            <p className="text-gray-600 mb-6">
              We are committed to providing excellent customer service and ensuring that every plant 
              you purchase from us meets our high standards of quality. Your satisfaction is our 
              top priority, and we're here to help you succeed in your plant journey.
            </p>
            
            <div className="mt-8 p-6 bg-primary-50 rounded-lg">
              <p className="text-primary-800 font-semibold">
                🌱 Start your plant journey with us today and bring nature into your home!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

