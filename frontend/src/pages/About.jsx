import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-32 max-w-4xl">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-8 shadow-sm">
            F
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">About FoodOS</h1>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              Welcome to <strong>FoodOS</strong>, the premium platform connecting food lovers with the absolute best local restaurants. Our mission is to make ordering delicious meals as seamless and enjoyable as possible.
            </p>
            <p>
              With FoodOS, you can explore diverse cuisines, curate your favorites into your personal profile, and track your orders in real-time. Whether you are craving a late-night dessert or a massive family dinner, we've got you covered with our fast, reliable network of delivery partners.
            </p>
            <p>
              Built entirely natively with beautiful UI conventions, FoodOS bridges the gap between top-notch culinary experiences and state-of-the-art technology.
            </p>

            <div className="bg-amber-50 p-6 rounded-xl mt-8 border border-amber-100">
              <h3 className="font-bold text-amber-800 mb-2">Our Values</h3>
              <ul className="list-disc pl-5 space-y-2 text-amber-700">
                <li>Quality food from verified restaurant partners</li>
                <li>Lightning-fast delivery tracking</li>
                <li>Beautiful and secure platform interface</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
