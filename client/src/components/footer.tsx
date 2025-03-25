import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Harker</h2>
            <p className="text-gray-300 max-w-md">
              Connecting senior communities through enriching video content and meaningful discussions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">User Guide</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Discussion Tips</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">HIPAA Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Support</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Partner With Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Harker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
