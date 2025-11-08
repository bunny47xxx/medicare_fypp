
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";

export default function Homepage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-400 text-white flex flex-col">
    <Header/>
      <section className="container mx-auto flex flex-col md:flex-row items-center gap-8 py-20">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight">Your Trusted Medicare Platform</h1>
          <p className="text-lg max-w-lg">
            Connecting Patients, Doctors, and Admins for seamless healthcare management.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" asChild>
              <a href="/auth/register">Get Started</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/auth/login">Login</a>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1580281658628-45070d2b9ce8?auto=format&fit=crop&w=600&q=60"
            alt="Healthcare Illustration"
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      <section className="bg-white text-black py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Patient Care',
              description: 'Easy appointment scheduling, medical records access, and personalized health insights.',
            },
            {
              title: 'Doctor Dashboard',
              description: 'Manage patient appointments, access records, and streamline workflow efficiently.',
            },
            {
              title: 'Admin Control',
              description: 'Monitor system usage, user management, and reports with ease.',
            },
          ].map(({ title, description }) => (
            <Card key={title} className="p-8 shadow-md">
              <h3 className="text-2xl font-semibold mb-3">{title}</h3>
              <p>{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-blue-700 text-white text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Healthcare Experience?</h2>
        <Button variant="secondary" asChild>
          <a href="/auth/register">Join Medicare Today</a>
        </Button>
      </section>
    <Footer/>
    </main>
  );
}
