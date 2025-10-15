import SearchBar from './SearchBar';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-primary lg:hidden">CADMS</h1>
        <SearchBar />
      </div>
    </nav>
  );
}
