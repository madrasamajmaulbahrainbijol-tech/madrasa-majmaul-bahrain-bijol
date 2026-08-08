import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Courses from "./components/Courses";
import WhyChooseUs from "./components/WhyChooseUs";
import Teachers from "./components/Teachers";
import Gallery from "./components/Gallery";
import Admission from "./components/Admission";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      <Navbar />

      <Hero />

      <About />

      <Courses />

      <WhyChooseUs />

      <Teachers />

      <Gallery />

      <Admission />

      

      <Contact />

      <Footer />

    </main>
  );
}