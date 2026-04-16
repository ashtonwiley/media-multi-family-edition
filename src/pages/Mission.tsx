import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Target, Lightbulb, Users } from "lucide-react";

const Mission = () => (
  <div className="min-h-screen">
    <SiteNav />
    <main>
      <section className="bg-hero">
        <div className="container py-20 text-center max-w-3xl mx-auto animate-fade-up">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-6">Our Mission</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Childhood deserves <span className="text-primary">better</span> than the algorithm.
          </h1>
          <p className="text-lg text-muted-foreground">
            The original Media Multi united social apps for convenience. The Family Edition unites them
            for protection — so kids can share with the people who love them, without the parts of the
            internet that don't.
          </p>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            icon: Target,
            title: "Goals",
            body: "Give families a single, safer window into the social world. Eliminate the dozen separate logins, the doomscrolling, and the predatory ads aimed at kids.",
          },
          {
            icon: Lightbulb,
            title: "Solutions",
            body: "One parent-managed account aggregates approved posts from every connected platform. AI moderation runs before content is shown. Strangers, ads, and infinite scroll are removed by default.",
          },
          {
            icon: Users,
            title: "For families",
            body: "Designed with child psychologists. Parents see a clear weekly digest of what their child watched, posted, and who they connected with — no spying, just transparency.",
          },
        ].map((item) => (
          <Card key={item.title} className="bg-card-grad border-border p-6 shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-glow mb-4">
              <item.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
            <p className="text-muted-foreground">{item.body}</p>
          </Card>
        ))}
      </section>

      <section className="container pb-20">
        <Card className="bg-card-grad border-border p-8 max-w-3xl mx-auto shadow-soft">
          <h2 className="text-3xl font-bold mb-6 text-center">Get in touch</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:hello@mediamulti.family"
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-bold">hello@mediamulti.family</div>
              </div>
            </a>
            <a
              href="tel:+13476754424"
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Family support line</div>
                <div className="font-bold">(347) 675-4424</div>
              </div>
            </a>
          </div>
        </Card>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default Mission;
