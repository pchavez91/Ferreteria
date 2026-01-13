import {
	Github,
	Linkedin,
	Mail,
	Code,
	FileText,
} from 'lucide-react';
import Link from 'next/link';

export function MinimalFooter() {
	const year = new Date().getFullYear();

	const socialLinks = [
		{
			icon: <Github className="size-4" />,
			link: 'https://github.com/pchavez91',
			label: 'GitHub',
		},
		{
			icon: <Linkedin className="size-4" />,
			link: 'https://www.linkedin.com/in/patricio-chavez-005b83352',
			label: 'LinkedIn',
		},
		{
			icon: <Mail className="size-4" />,
			link: 'mailto:pchavez.dev@gmail.com',
			label: 'Email',
		},
	];

	const quickLinks = [
		{
			title: 'Repositorio',
			href: 'https://github.com/pchavez91/ferreteria',
			icon: <Code className="size-3" />,
		},
		{
			title: 'Licencia MIT',
			href: 'https://github.com/pchavez91/ferreteria',
			icon: <FileText className="size-3" />,
		},
	];

	return (
		<footer className="relative mt-auto border-t border-border/30 bg-card/60 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
					{/* Información del Sistema */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
							Sistema de Gestión
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Sistema completo de gestión para ferretería desarrollado con Next.js, TypeScript y Supabase.
						</p>
					</div>

					{/* Enlaces Rápidos */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
							Enlaces Rápidos
						</h3>
						<ul className="space-y-2">
							{quickLinks.map((link, i) => (
								<li key={i}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
									>
										{link.icon}
										{link.title}
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Redes Sociales */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
							Conecta conmigo
						</h3>
						<div className="flex gap-3">
							{socialLinks.map((item, i) => (
								<a
									key={i}
									className="hover:bg-accent/50 rounded-lg border border-border/30 p-2.5 transition-all duration-200 hover:border-primary/30 hover:scale-110"
									target="_blank"
									rel="noopener noreferrer"
									href={item.link}
									aria-label={item.label}
									title={item.label}
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="border-t border-border/30 pt-6">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground text-center md:text-left">
							© {year} Ferretería. Todos los derechos reservados.
						</p>
						<p className="text-sm text-muted-foreground text-center md:text-right">
							Desarrollado por{' '}
							<a 
								href="https://github.com/pchavez91" 
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline font-medium"
							>
								Patricio Chávez
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
