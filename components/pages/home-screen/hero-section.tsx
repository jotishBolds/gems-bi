"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, Zap, Headphones, ChevronRight } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSection />
      <FeaturesSection />
      <StatisticsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

const HeroSection = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(300, 300);
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const geometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.TorusGeometry(0.3, 0.2, 16, 100),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.OctahedronGeometry(0.4),
    ];

    const colors = [0x4f46e5, 0x06b6d4, 0x10b981, 0xf59e0b, 0xef4444];

    geometries.forEach((geometry, index) => {
      const material = new THREE.MeshPhongMaterial({
        color: colors[index],
        shininess: 100,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      group.add(mesh);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 3;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.x += 0.005;
      group.rotation.y += 0.005;
      geometries.forEach((_, index) => {
        group.children[index].rotation.x += 0.01;
        group.children[index].rotation.y += 0.01;
      });
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-50 via-blue-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mb-12 md:mb-0"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Revolutionize <br />
              <span className="text-indigo-600">Government Employee</span>{" "}
              <br />
              Management
            </h1>
            <p className="text-xl mb-8 text-gray-700 leading-relaxed">
              GEMS: Streamline tasks, boost productivity, and enhance
              satisfaction with our cutting-edge system.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105">
                Get Started
              </Button>
              <Button
                variant="outline"
                className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 flex justify-center items-center"
          >
            <div
              ref={mountRef}
              className="w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full shadow-lg flex items-center justify-center"
            ></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users size={40} className="text-indigo-500" />,
      title: "Employee Data Management",
      description:
        "Centralize and organize employee information for easy access and updates.",
    },
    {
      icon: <TrendingUp size={40} className="text-blue-500" />,
      title: "Performance Tracking",
      description:
        "Monitor and evaluate employee performance with customizable metrics.",
    },
    {
      icon: <Zap size={40} className="text-green-500" />,
      title: "Automated Workflows",
      description:
        "Streamline administrative processes with intelligent automation.",
    },
    {
      icon: <Headphones size={40} className="text-yellow-500" />,
      title: "24/7 Support",
      description:
        "Get help anytime with our round-the-clock customer support team.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatisticsSection = () => {
  const stats = [
    { value: "10,000+", label: "Employees Managed" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "50%", label: "Time Saved" },
    { value: "24/7", label: "Support" },
  ];

  const chartData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-indigo-200">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            Employee Productivity Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#4b5563" />
              <YAxis stroke="#4b5563" />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "John Doe",
      role: "HR Manager",
      content:
        "GEMS has transformed our HR processes, making employee management a breeze. The intuitive interface and powerful features have significantly improved our efficiency.",
      avatar: "/images/user-avatar.png",
    },
    {
      name: "Jane Smith",
      role: "Department Head",
      content:
        "The insights provided by GEMS have helped us make informed decisions and improve overall efficiency. It's been a game-changer for our department's productivity.",
      avatar: "/images/user-avatar.png",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-indigo-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 bg-indigo-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your Employee Management?
        </h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of government organizations already benefiting from
          GEMS. Streamline your processes and boost productivity today.
        </p>
        <Button className="bg-white text-indigo-900 hover:bg-indigo-100 px-10 py-4 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 flex items-center mx-auto">
          Get Started Today
          <ChevronRight className="ml-2" />
        </Button>
      </div>
    </section>
  );
};

export default HomePage;
