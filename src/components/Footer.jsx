import { Wrench } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-20" id="contacto">
            <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Wrench className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-white text-lg">MCC Tools</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        Tu tienda de herramientas y equipos de calidad.
                        Servicio en Ecuador y Colombia.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4">Enlaces</h4>
                    <ul className="flex flex-col gap-2 text-sm">
                        <li><a href="/" className="hover:text-white transition">Tienda</a></li>
                        <li><a href="#categorias" className="hover:text-white transition">Categorías</a></li>
                        <li><a href="#contacto" className="hover:text-white transition">Contacto</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4">Contacto</h4>
                    <ul className="flex flex-col gap-2 text-sm">
                        <li>📧 info@mcctools.com</li>
                        <li>📞 +593 99 999 9999</li>
                        <li>📍 Ecuador & Colombia</li>
                    </ul>
                </div>

            </div>
            <div className="border-t border-gray-800 text-center py-4 text-xs">
                © 2025 MCC Tools. Todos los derechos reservados.
            </div>
        </footer>
    )
}