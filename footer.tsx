import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-background border-t py-6 md:py-8">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="font-bold text-lg">Lucky Lottery</Link>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Lucky Lottery. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4 md:mt-0">
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact Us
          </Link>
        </div>
      </div>
      
      <div className="container mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">KYC NOT REQUIRED</span> to deposit or withdraw funds.
        </p>
      </div>
    </footer>
  );
}