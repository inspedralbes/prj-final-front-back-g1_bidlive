import React, { useEffect, useState } from 'react';

const PaymentSuccessOverlay = ({ onComplete }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            
            <div className={`relative bg-[#0d0d12] border border-white/10 p-12 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center transform transition-all duration-700 ${visible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'}`}>
                {/* Checkmark Animation */}
                <div className="success-checkmark mb-8 mx-auto">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>

                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">¡Pago Exitoso!</h2>
                <p className="text-gray-400 font-medium">Tu transacción se ha procesado correctamente.</p>
                
                <div className="mt-8 flex justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .success-checkmark {
                    width: 100px;
                    height: 100px;
                    position: relative;
                }
                .check-icon {
                    width: 100px;
                    height: 100px;
                    position: relative;
                    border-radius: 50%;
                    box-sizing: content-box;
                    border: 4px solid #10b981;
                }
                .check-icon::before {
                    top: 3px;
                    left: -2px;
                    width: 30px;
                    transform-origin: 100% 50%;
                    border-radius: 100px 0 0 100px;
                }
                .check-icon::after {
                    top: 0;
                    left: 30px;
                    width: 60px;
                    transform-origin: 0 50%;
                    border-radius: 0 100px 100px 0;
                    animation: rotate-circle 4.25s ease-in;
                }
                .icon-line {
                    height: 5px;
                    background-color: #10b981;
                    display: block;
                    border-radius: 2px;
                    position: absolute;
                    z-index: 10;
                }
                .line-tip {
                    width: 25px;
                    left: 20px;
                    top: 52px;
                    transform: rotate(45deg);
                    animation: icon-line-tip 0.75s;
                }
                .line-long {
                    width: 47px;
                    right: 14px;
                    top: 44px;
                    transform: rotate(-45deg);
                    animation: icon-line-long 0.75s;
                }
                .icon-circle {
                    top: -4px;
                    left: -4px;
                    z-index: 10;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    position: absolute;
                    box-sizing: content-box;
                    border: 4px solid rgba(16, 185, 129, .5);
                }
                .icon-fix {
                    top: 8px;
                    width: 5px;
                    left: 26px;
                    z-index: 1;
                    height: 85px;
                    position: absolute;
                    transform: rotate(-45deg);
                    background-color: transparent;
                }
                @keyframes icon-line-tip {
                    0% { width: 0; left: 1px; top: 19px; }
                    54% { width: 0; left: 1px; top: 19px; }
                    70% { width: 50px; left: -8px; top: 37px; }
                    84% { width: 17px; left: 21px; top: 53px; }
                    100% { width: 25px; left: 20px; top: 52px; }
                }
                @keyframes icon-line-long {
                    0% { width: 0; right: 46px; top: 54px; }
                    65% { width: 0; right: 46px; top: 54px; }
                    84% { width: 55px; right: 0px; top: 35px; }
                    100% { width: 47px; right: 14px; top: 44px; }
                }
            `}} />
        </div>
    );
};

export default PaymentSuccessOverlay;
