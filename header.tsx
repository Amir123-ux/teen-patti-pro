import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, User, Wallet, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const closeMenu = () => setIsMenuOpen(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getName = () => {
    if (!user) return 'Guest';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };
  
  // Navigation links
  const navItems = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5 mr-2" /> },
  ];
  
  // Authenticated-only links
  const authItems = [
    { href: '/profile', label: 'My Profile', icon: <User className="h-5 w-5 mr-2" /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5 mr-2" /> },
    { href: '/tickets', label: 'My Tickets', icon: <Wallet className="h-5 w-5 mr-2" /> },
  ];
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="px-2">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold">Lucky Lottery</h2>
                  <Button variant="ghost" size="icon" onClick={closeMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center text-sm transition-colors hover:text-foreground/80 ${
                        location.pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                      }`}
                      onClick={closeMenu}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  
                  {isAuthenticated && (
                    <>
                      <div className="my-2 h-px bg-border" />
                      {authItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`flex items-center text-sm transition-colors hover:text-foreground/80 ${
                            location.pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                          }`}
                          onClick={closeMenu}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="justify-start p-0 text-sm text-red-600 hover:text-red-700"
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center space-x-2">
            <span className="hidden sm:inline-block font-bold text-xl">Lucky Lottery</span>
            <span className="sm:hidden font-bold text-xl">Lucky</span>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                location.pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="mr-2">
                <Link to="/buy">Buy Tickets</Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={''} alt={user?.name || 'User'} />
                      <AvatarFallback>{getName()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {authItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center cursor-pointer">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}