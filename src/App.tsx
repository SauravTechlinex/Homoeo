import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Stethoscope, 
  Heart, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Menu, 
  X,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Toaster, toast } from 'sonner';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { cn } from './lib/utils';

// --- Types & Schemas ---

const appointmentSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientEmail: z.string().email("Invalid email address"),
  patientPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Appointment', href: '#appointment' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Stethoscope size={24} />
          </div>
          <span className={cn(
            "font-bold text-xl tracking-tight",
            isScrolled ? "text-slate-900" : "text-emerald-900"
          )}>
            Dr. Sarkar's <span className="text-emerald-600">Homoeo</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#appointment"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            Book Now
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 md:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-700 hover:text-emerald-600"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#appointment"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-center font-semibold"
            >
              Book Appointment
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-emerald-50/30">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-emerald-100/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} />
            Trusted Homoeopathic Care
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
            Healing Naturally, <br />
            <span className="text-emerald-600 italic">Living Better.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
            Experience the power of multispeciality homoeopathic treatment. Dr. Sarkar provides personalized care for chronic and acute conditions with a holistic approach.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#appointment"
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl shadow-emerald-200 group"
            >
              Book Appointment
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#services"
              className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Our Services
            </a>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-slate-900">15+</div>
              <div className="text-sm text-slate-500">Years Experience</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <div className="text-3xl font-bold text-slate-900">10k+</div>
              <div className="text-sm text-slate-500">Happy Patients</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <div className="text-3xl font-bold text-slate-900">99%</div>
              <div className="text-sm text-slate-500">Success Rate</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1000" 
              alt="Doctor Consultation" 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-emerald-50"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Holistic Care</div>
              <div className="text-xs text-slate-500">Natural Treatment</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Chronic Diseases",
      desc: "Effective treatment for long-term ailments like Arthritis, Diabetes, and Hypertension.",
      icon: <Heart className="text-rose-500" />,
      color: "bg-rose-50"
    },
    {
      title: "Skin & Hair Care",
      desc: "Natural solutions for Psoriasis, Eczema, Hair fall, and other dermatological issues.",
      icon: <User className="text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Pediatric Care",
      desc: "Gentle and safe homoeopathic treatment for children's immunity and growth.",
      icon: <Activity className="text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Mental Wellness",
      desc: "Addressing Anxiety, Depression, and Stress-related disorders naturally.",
      icon: <ShieldCheck className="text-purple-500" />,
      color: "bg-purple-50"
    },
    {
      title: "Respiratory Issues",
      desc: "Treatment for Asthma, Bronchitis, and Sinusitis without side effects.",
      icon: <Stethoscope className="text-amber-500" />,
      color: "bg-amber-50"
    },
    {
      title: "Digestive Health",
      desc: "Relief from Gastritis, IBS, and chronic constipation through homoeopathy.",
      icon: <Activity className="text-cyan-500" />,
      color: "bg-cyan-50"
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4">Our Expertise</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Specialized Homoeopathic Services</h3>
          <p className="text-slate-500 max-w-2xl mx-auto">
            We offer a wide range of multispeciality treatments tailored to your unique health needs, focusing on the root cause rather than just symptoms.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", service.color)}>
                {service.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-500 leading-relaxed mb-6">{service.desc}</p>
              <a href="#appointment" className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AppointmentSection = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema)
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      await addDoc(collection(db, 'appointments'), {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success("Appointment request sent successfully!");
      reset();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  return (
    <section id="appointment" className="py-24 bg-emerald-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4">Book a Visit</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-8">Schedule Your Consultation Today</h3>
          <p className="text-emerald-100/80 text-lg mb-12 leading-relaxed">
            Take the first step towards holistic healing. Fill out the form, and our team will get back to you to confirm your slot.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-400">
                <Clock size={24} />
              </div>
              <div>
                <div className="font-bold">Clinic Hours</div>
                <div className="text-emerald-100/60 text-sm">Mon - Sat: 10:00 AM - 8:00 PM</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-400">
                <Phone size={24} />
              </div>
              <div>
                <div className="font-bold">Call for Emergency</div>
                <div className="text-emerald-100/60 text-sm">+91 88202 82146</div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 text-slate-900 shadow-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  {...register('patientName')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="John Doe"
                />
                {errors.patientName && <p className="text-xs text-rose-500">{errors.patientName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <input 
                  {...register('patientPhone')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="+91 00000 00000"
                />
                {errors.patientPhone && <p className="text-xs text-rose-500">{errors.patientPhone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input 
                {...register('patientEmail')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="john@example.com"
              />
              {errors.patientEmail && <p className="text-xs text-rose-500">{errors.patientEmail.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service</label>
                <select 
                  {...register('service')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                >
                  <option value="">Select Service</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Chronic Disease">Chronic Disease</option>
                  <option value="Skin & Hair">Skin & Hair</option>
                  <option value="Pediatric">Pediatric</option>
                </select>
                {errors.service && <p className="text-xs text-rose-500">{errors.service.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Preferred Date</label>
                <input 
                  type="date"
                  {...register('date')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                />
                {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Preferred Time</label>
              <select 
                {...register('time')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value="">Select Time Slot</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
              {errors.time && <p className="text-xs text-rose-500">{errors.time.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm Appointment"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4">Get In Touch</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">We're Here to Help You Heal</h3>
            <p className="text-slate-500 text-lg mb-12 leading-relaxed">
              Have questions about our treatments or want to know more about homoeopathy? Feel free to reach out.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Our Clinic</div>
                  <div className="text-slate-500">123 Health Avenue, Medical District, Kolkata, WB 700001</div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Email Us</div>
                  <div className="text-slate-500">contact@drsarkarclinic.com</div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Call Us</div>
                  <div className="text-slate-500">+91 88202 82146</div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl shadow-sm flex items-center justify-center text-white shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">WhatsApp</div>
                  <a 
                    href="https://wa.me/918820282146" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Your Name</label>
                <input 
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="Full Name"
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input 
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Subject</label>
                <input 
                  {...register('subject')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="How can we help?"
                />
                {errors.subject && <p className="text-xs text-rose-500">{errors.subject.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Message</label>
                <textarea 
                  {...register('message')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                  placeholder="Your message here..."
                />
                {errors.message && <p className="text-xs text-rose-500">{errors.message.message}</p>}
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Stethoscope size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Dr. Sarkar's <span className="text-emerald-600">Homoeo</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              Providing premium multispeciality homoeopathic care since 2010. We believe in natural healing and holistic wellness for all our patients.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#home" className="hover:text-emerald-600 transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-emerald-600 transition-colors">Services</a></li>
              <li><a href="#about" className="hover:text-emerald-600 transition-colors">About Us</a></li>
              <li><a href="#appointment" className="hover:text-emerald-600 transition-colors">Appointment</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2026 Dr. Sarkar's Multispeciality Homoeo Clinic. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://wa.me/918820282146" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">WhatsApp</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Facebook</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/918820282146"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
    >
      <MessageCircle size={32} />
    </motion.a>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="font-sans text-slate-900 bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <Toaster position="top-center" richColors />
      <Navbar />
      <WhatsAppButton />
      <Hero />
      
      {/* Trust Banner */}
      <div className="bg-emerald-50 py-10 border-y border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-slate-400"><ShieldCheck /> ISO CERTIFIED</div>
          <div className="flex items-center gap-2 font-bold text-slate-400"><Activity /> NABH ACCREDITED</div>
          <div className="flex items-center gap-2 font-bold text-slate-400"><Heart /> PATIENT FIRST</div>
          <div className="flex items-center gap-2 font-bold text-slate-400"><Stethoscope /> EXPERT DOCTORS</div>
        </div>
      </div>

      <Services />

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=1000" 
                alt="Clinic Interior" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full flex items-center justify-center text-white text-center p-4 shadow-xl z-20 border-4 border-white">
              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-[10px] uppercase font-bold tracking-widest">Natural Healing</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4">About the Clinic</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">A Legacy of Natural Healing and Compassion</h3>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
              Dr. Sarkar's Multispeciality Homoeo Clinic was founded with a vision to provide safe, effective, and permanent cures for various health conditions using the principles of classical homoeopathy.
            </p>
            <p className="text-slate-600 mb-10 leading-relaxed">
              Our approach is patient-centric. We spend time understanding the physical, mental, and emotional state of our patients to prescribe the most suitable remedy. Our medicines are sourced from the finest homoeopathic pharmacies to ensure maximum efficacy.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ChevronRight size={14} />
                </div>
                <span className="font-semibold text-slate-700">Holistic Diagnosis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ChevronRight size={14} />
                </div>
                <span className="font-semibold text-slate-700">Zero Side Effects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ChevronRight size={14} />
                </div>
                <span className="font-semibold text-slate-700">Modern Facilities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ChevronRight size={14} />
                </div>
                <span className="font-semibold text-slate-700">Expert Guidance</span>
              </div>
            </div>

            <a 
              href="#contact"
              className="inline-flex items-center gap-2 text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1 hover:gap-4 transition-all"
            >
              Learn more about our philosophy <ArrowRight size={20} />
            </a>
          </motion.div>
        </div>
      </section>

      <AppointmentSection />
      <Contact />
      <Footer />
    </div>
  );
}
