import React from 'react';
import { Mail, Shield, Heart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
             <span>&copy; {new Date().getFullYear()} UniParty.</span>
             <span className="hidden sm:inline">Made with</span>
             <Heart className="h-3 w-3 text-red-500 hidden sm:block" />
             <span className="hidden sm:inline">for students.</span>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
            <Link to="/terms" className="text-gray-400 hover:text-indigo-400 flex items-center justify-center sm:justify-start text-sm transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Termini & Condizioni
            </Link>

            <Link to="/privacy" className="text-gray-400 hover:text-indigo-400 flex items-center justify-center sm:justify-start text-sm transition-colors">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Link>
            
            <a href="mailto:uniparty.team@gmail.com" className="text-gray-400 hover:text-indigo-400 flex items-center justify-center sm:justify-start text-sm transition-colors">
              <Mail className="h-4 w-4 mr-2" />
              Technical Support
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;