'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/header';
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const launchDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header/>
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8 animate-bounce">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p className="mb-12 max-w-2xl text-xl text-gray-300 md:text-2xl">
          We're crafting something <span className="font-bold text-purple-400">extraordinary</span>.
          Stay tuned for the launch!
        </p>

        {/* Countdown Timer */}
        <div className="mb-16 grid grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-2xl bg-white/10 p-4 backdrop-blur-lg transition-all hover:scale-105 hover:bg-white/20 md:p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="text-3xl font-bold text-white md:text-5xl">
                  {item.value.toString().padStart(2, '0')}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-gray-400 md:text-sm">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Notification */}
        <div className="w-full max-w-md">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-75 blur transition duration-300 group-hover:opacity-100" />
            <div className="relative flex overflow-hidden rounded-full bg-white/10 backdrop-blur-lg">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-6 py-4 text-white placeholder-gray-400 outline-none"
              />
              <button className="px-6 py-4 font-semibold text-white transition hover:bg-white/10">
                Notify Me
              </button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 flex gap-6">
          <a
            href="#"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg transition-all hover:scale-110 hover:bg-white/20"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <svg className="relative h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          <a
            href="#"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg transition-all hover:scale-110 hover:bg-white/20"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <svg className="relative h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="#"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg transition-all hover:scale-110 hover:bg-white/20"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <svg className="relative h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="#"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg transition-all hover:scale-110 hover:bg-white/20"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <svg className="relative h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        {/* Footer Text */}
        <p className="mt-16 text-sm text-gray-400">
          © 2025 SperoLife. All rights reserved.
        </p>
      </div>

      {/* Floating Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000" />
        <div className="absolute right-1/3 top-1/3 h-72 w-72 animate-pulse rounded-full bg-pink-500/10 blur-3xl delay-500" />
      </div>
    </div>
  );
}