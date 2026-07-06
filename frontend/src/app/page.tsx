import Link from 'next/link';
import {
  HeartHandshake,
  ShieldCheck,
  MapPin,
  PackageCheck,
  Shirt,
  Footprints,
  Layers,
  Blocks,
  BookOpen,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DONATION_STATUS_LABELS, DONATION_STATUS_COLORS } from '@/lib/constants';
import Image from 'next/image';


const categories = [
  { label: 'Roupas', icon: Shirt },
  { label: 'Calçado', icon: Footprints },
  { label: 'Cobertores', icon: Layers },
  { label: 'Brinquedos', icon: Blocks },
  { label: 'Livros', icon: BookOpen },
  { label: 'Outros materiais', icon: Package },
];

const steps = [
  {
    icon: MapPin,
    title: 'Escolhe um ponto de recolha',
    description: 'Vês os pontos de recolha da Fundação Hubble perto de ti e escolhes o mais conveniente.',
  },
  {
    icon: HeartHandshake,
    title: 'Regista a tua doação',
    description: 'Descreves o que vais doar — roupas, calçado, cobertores e outros materiais não perecíveis.',
  },
  {
    icon: ShieldCheck,
    title: 'A fundação aprova e recebe',
    description: 'A equipa confirma o ponto de recolha e regista a entrega assim que a recebe fisicamente.',
  },
  {
    icon: PackageCheck,
    title: 'A doação chega a quem precisa',
    description: 'Acompanhas cada fase até à entrega final, com uma mensagem de agradecimento no fim.',
  },
];

const statusFlow: Array<keyof typeof DONATION_STATUS_LABELS> = [
  'PENDING',
  'APPROVED',
  'RECEIVED',
  'IN_DELIVERY',
  'DONATED',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              H
            </div>
            <span className="text-sm font-semibold text-foreground">Fundação Hubble</span>
          </div>
         <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Entrar
          </Button>
          <Button render={<Link href="/register" />}>Criar conta</Button>
        </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <HeartHandshake className="h-3.5 w-3.5" />
              Doações que salvam vidas
            </span>

            <h1 className="mt-5 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              A tua roupa parada num armário pode aquecer alguém hoje.
            </h1>

            <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
              A Fundação Hubble liga quem tem para dar a quem precisa de receber.
              Escolhe um ponto de recolha, entrega os teus materiais e acompanha
              cada etapa até chegarem a quem mais precisa.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
             <Button render={<Link href="/register" />}>
                Criar conta
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />}>
                Já tenho conta
              </Button>
            </div>
          </div>

          {/* Ilustração original em SVG */}
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            <svg viewBox="0 0 400 400" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" r="170" className="fill-muted" />
              <circle cx="320" cy="90" r="14" className="fill-primary/25" />
              <circle cx="70" cy="310" r="10" className="fill-primary/25" />
              <circle cx="60" cy="90" r="7" className="fill-primary/35" />

              {/* Mão esquerda */}
              <path
                d="M70 250 Q100 220 150 235 L175 250 L165 275 L120 260 Q95 255 80 270 Z"
                className="fill-secondary stroke-border"
                strokeWidth="2"
              />
              {/* Mão direita */}
              <path
                d="M330 250 Q300 220 250 235 L225 250 L235 275 L280 260 Q305 255 320 270 Z"
                className="fill-secondary stroke-border"
                strokeWidth="2"
              />

              {/* Caixa de doação */}
              <rect x="150" y="180" width="100" height="80" rx="8" className="fill-primary" />
              <rect x="150" y="180" width="100" height="24" rx="8" className="fill-primary/80" />
              <path d="M150 204 L250 204" className="stroke-primary-foreground/40" strokeWidth="2" />

              {/* Coração na caixa */}
              <path
                d="M200 240 C193 230 175 232 175 248 C175 260 200 275 200 275 C200 275 225 260 225 248 C225 232 207 230 200 240 Z"
                className="fill-primary-foreground"
              />

              {/* Roupa a espreitar da caixa */}
              <path
                d="M162 180 C168 165 190 162 200 175 C210 162 232 165 238 180 L232 190 L168 190 Z"
                className="fill-card stroke-border"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Como funciona</h2>
            <p className="mt-2 text-muted-foreground">
              Um processo simples, transparente, do momento em que entregas até à doação final.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-2xl border border-border bg-background p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute top-4 right-4 text-xs font-semibold text-muted-foreground">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Acompanhamento de status */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Acompanha a tua doação em cada etapa
            </h2>
            <p className="mt-3 text-muted-foreground">
              Desde o momento em que entregas no ponto de recolha até à entrega final a quem
              precisa, vais sempre saber em que fase está a tua doação — sem surpresas.
            </p>
            <p className="mt-3 text-muted-foreground">
              Quando a doação chega ao destino final, recebes uma mensagem de agradecimento
              da Fundação Hubble, com a confirmação de que ajudaste a mudar a vida de alguém.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Percurso de uma doação
            </p>
            <ol className="space-y-4">
              {statusFlow.map((status, i) => (
                <li key={status} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${DONATION_STATUS_COLORS[status]}`}
                  >
                    {DONATION_STATUS_LABELS[status]}
                  </span>
                  {i < statusFlow.length - 1 && (
                    <span className="h-px flex-1 bg-border" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Imagens do sistema / impacto real */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Vê o impacto em imagens</h2>
            <p className="mt-2 text-muted-foreground">
              Do momento da recolha até chegar a quem precisa — cada doação tem uma história.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                src: '/images/doacao-recolha.jpeg',
                alt: 'Voluntários a organizar doações recebidas',
                caption: 'Recolha organizada em cada ponto da fundação',
              },
              {
                src: '/images/doacao-entrega.png',
                alt: 'Pessoa a entregar sacos de roupa num ponto de recolha',
                caption: 'A tua entrega no ponto de recolha',
              },
              {
                src: '/images/doacao-impacto.jpeg',
                alt: 'Momento de entrega de doações a quem precisa',
                caption: 'O momento em que a doação chega a quem precisa',
              },
            ].map((img) => (
              <div key={img.src} className="overflow-hidden rounded-2xl border border-border bg-muted">
                <div className="relative aspect-video w-full">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" />
                </div>
                <p className="px-4 py-3 text-sm font-medium text-foreground">{img.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias aceites */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">O que podes doar</h2>
            <p className="mt-2 text-muted-foreground">
              Apenas materiais não perecíveis, em bom estado — cada item conta.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-5 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <HeartHandshake className="h-10 w-10" />
          <h2 className="text-2xl font-semibold md:text-3xl">Pronto para fazer a diferença?</h2>
          <p className="max-w-md text-sm text-primary-foreground/80 md:text-base">
            Cria a tua conta gratuita e faz a tua primeira doação em poucos minutos.
          </p>
          <Button render={<Link href="/register" />}>
            Criar conta grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
          <span>© {new Date().getFullYear()} Fundação Hubble. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}