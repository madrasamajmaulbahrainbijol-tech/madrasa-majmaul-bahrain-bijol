import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import NoticeBoard from "./components/NoticeBoard";
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
    <main>
      <Navbar />

      <Hero />

      <NoticeBoard />

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
