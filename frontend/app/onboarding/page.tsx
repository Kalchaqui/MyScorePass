'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletManager from '@/components/WalletManager';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Upload, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dniFrontFile, setDniFrontFile] = useState<File | null>(null);
  const [dniBackFile, setDniBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [userStatus, setUserStatus] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'front' | 'back' | 'complete'>('front');

  const walletAddress = address;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar estado del usuario
  useEffect(() => {
    if (walletAddress) {
      fetch(`http://localhost:3001/api/users/status/${walletAddress}`)
        .then(res => res.json())
        .then(data => {
          if (data.status && data.status !== 'not_found') {
            setUserStatus(data.status);
            if (data.status === 'approved') {
              router.push('/dashboard');
            }
          }
        })
        .catch(console.error);
    }
  }, [walletAddress, router]);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDniFrontFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDniBackFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'front') {
      if (!dniFrontFile) {
        toast.error('Por favor selecciona la imagen del frente del DNI');
        return;
      }
      setCurrentStep('back');
    } else if (currentStep === 'back') {
      if (!dniBackFile) {
        toast.error('Por favor selecciona la imagen del reverso del DNI');
        return;
      }
      setCurrentStep('complete');
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'back') {
      setCurrentStep('front');
    } else if (currentStep === 'complete') {
      setCurrentStep('back');
    }
  };

  const handleUpload = async () => {
    if (!dniFrontFile || !dniBackFile || !walletAddress) {
      toast.error('Falta información');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('dniFront', dniFrontFile);
    formData.append('dniBack', dniBackFile);
    formData.append('privyUserId', walletAddress || '');
    formData.append('walletAddress', walletAddress);
    formData.append('email', '');

    try {
      const response = await fetch('http://localhost:3001/api/users/upload-dni', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('¡DNI subido exitosamente!');
        setUserStatus('pending');
      } else {
        console.error('Backend error:', data);
        toast.error(data.error || 'Error al subir DNI');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Error de conexión. Verifica que el backend esté corriendo.');
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="glass-card text-center py-20 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Conecta tu Wallet</h2>
          <WalletManager />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white">Verificación de Identidad</h1>
              </div>
            </div>
            <WalletManager />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-40 pb-20">
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === 'front' ? 'bg-blue-500' : 'bg-green-500'}`}>
              {currentStep === 'front' ? '1' : <CheckCircle className="w-6 h-6 text-white" />}
            </div>
            <div className={`h-1 w-20 ${currentStep !== 'front' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === 'back' ? 'bg-blue-500' : currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-500'}`}>
              {currentStep === 'complete' ? <CheckCircle className="w-6 h-6 text-white" /> : '2'}
            </div>
            <div className={`h-1 w-20 ${currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep === 'complete' ? 'bg-blue-500' : 'bg-gray-500'}`}>
              3
            </div>
          </div>
          <div className="flex justify-center space-x-16 text-sm text-white/70">
            <span>Frente DNI</span>
            <span>Reverso DNI</span>
            <span>Enviar</span>
          </div>
        </div>

        {userStatus === 'pending' ? (
          <div className="glass-card text-center py-20">
            <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Verificación Pendiente</h2>
            <p className="text-white/70 mb-6">
              Tu DNI está siendo revisado por un administrador. Recibirás una notificación cuando sea aprobado.
            </p>
            <Link href="/dashboard" className="btn-secondary">
              Volver al Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Instrucciones */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Verificación de Identidad
              </h3>
              <p className="text-white/70 mb-4">
                Para verificar tu identidad, necesitamos fotos claras de ambos lados de tu DNI o documento de identidad.
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Asegúrate que las fotos estén claras y legibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>El documento debe estar completo en ambas imágenes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Formato: JPG, PNG (máx 10MB cada una)</span>
                </div>
              </div>
            </div>

            {/* Paso 1: Frente del DNI */}
            {currentStep === 'front' && (
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4">Paso 1: Frente del DNI</h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-green-500/50 rounded-xl p-8 text-center">
                    {frontPreview ? (
                      <div className="space-y-4">
                        <img src={frontPreview} alt="Frente DNI" className="max-w-full h-64 object-contain mx-auto rounded-lg" />
                        <p className="text-white/70 text-sm">Click para cambiar imagen</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontFileChange}
                          className="hidden"
                          id="front-upload"
                        />
                        <label htmlFor="front-upload" className="btn-secondary cursor-pointer">
                          Cambiar Imagen
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-white/30 mx-auto" />
                        <div>
                          <p className="text-white font-semibold mb-2">Subir Frente del DNI</p>
                          <p className="text-white/70 text-sm mb-4">
                            Haz clic aquí o arrastra la imagen del frente de tu DNI
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFrontFileChange}
                            className="hidden"
                            id="front-upload"
                          />
                          <label htmlFor="front-upload" className="btn-primary cursor-pointer">
                            Seleccionar Imagen
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleNextStep}
                    disabled={!dniFrontFile}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>Continuar al Reverso</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Reverso del DNI */}
            {currentStep === 'back' && (
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4">Paso 2: Reverso del DNI</h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-green-500/50 rounded-xl p-8 text-center">
                    {backPreview ? (
                      <div className="space-y-4">
                        <img src={backPreview} alt="Reverso DNI" className="max-w-full h-64 object-contain mx-auto rounded-lg" />
                        <p className="text-white/70 text-sm">Click para cambiar imagen</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackFileChange}
                          className="hidden"
                          id="back-upload"
                        />
                        <label htmlFor="back-upload" className="btn-secondary cursor-pointer">
                          Cambiar Imagen
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-white/30 mx-auto" />
                        <div>
                          <p className="text-white font-semibold mb-2">Subir Reverso del DNI</p>
                          <p className="text-white/70 text-sm mb-4">
                            Haz clic aquí o arrastra la imagen del reverso de tu DNI
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackFileChange}
                            className="hidden"
                            id="back-upload"
                          />
                          <label htmlFor="back-upload" className="btn-primary cursor-pointer">
                            Seleccionar Imagen
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleBackStep}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Volver</span>
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!dniBackFile}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      <span>Revisar y Enviar</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Revisar y Enviar */}
            {currentStep === 'complete' && (
              <div className="glass-card">
                <h4 className="text-xl font-bold text-white mb-4">Paso 3: Revisar y Enviar</h4>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-2">Frente del DNI</h5>
                      <img src={frontPreview} alt="Frente DNI" className="w-full h-48 object-contain bg-white/10 rounded-lg" />
                    </div>
                    <div>
                      <h5 className="text-white font-semibold mb-2">Reverso del DNI</h5>
                      <img src={backPreview} alt="Reverso DNI" className="w-full h-48 object-contain bg-white/10 rounded-lg" />
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-xl">
                    <p className="text-white font-semibold mb-2">⚠️ Importante</p>
                    <p className="text-white/70 text-sm">
                      Una vez enviado, no podrás modificar las imágenes. Asegúrate de que ambas fotos sean claras y legibles.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleBackStep}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Volver</span>
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Enviar DNI para Verificación</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}