"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";

interface SubscriptionCard {
  _id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


export default function SubscriptionCardsAdmin() {
  const [cards, setCards] = useState<SubscriptionCard[]>([]);
  const [form, setForm] = useState<SubscriptionCard>({
    title: "",
    price: "",
    period: "",
    description: "",
    features: [],
    button: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/subscription-cards`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCards(data);
        } else if (Array.isArray(data.data)) {
          setCards(data.data);
        } else {
          setCards([]);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, features: e.target.value.split("\n") });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/api/admin/subscription-cards/${editingId}` : `${API_URL}/api/admin/subscription-cards`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", price: "", period: "", description: "", features: [], button: "" });
    setEditingId(null);
    setShowForm(false);
    fetch(`${API_URL}/api/admin/subscription-cards`).then((res) => res.json()).then(setCards);
  };

  const handleEdit = (card: SubscriptionCard) => {
    setForm(card);
    setEditingId(card._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/subscription-cards/${id}`, { method: "DELETE" });
    fetch(`${API_URL}/api/admin/subscription-cards`).then((res) => res.json()).then(setCards);
  };

  const handleAddNew = () => {
    setForm({ title: "", price: "", period: "", description: "", features: [], button: "" });
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Manage Subscription Cards</h1>
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
            onClick={handleAddNew}
          >
            + Add New Card
          </button>
        </div>
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {Array.isArray(cards) && cards.length > 0 ? (
            cards.map((card) => (
              <div key={card._id} className="flex flex-col items-center">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="py-2 px-4 rounded-lg border-2 border-[#FA7035] text-[#FA7035] font-semibold bg-white hover:bg-[#FFC1A0] transition focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center"
                  >
                    <span className="material-icons align-middle mr-1">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(card._id!)}
                    className="py-2 px-4 rounded-lg border-2 border-red-400 text-red-600 font-semibold bg-white hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center"
                  >
                    <span className="material-icons align-middle mr-1">Delete</span>
                  </button>
                </div>
                <div
                  className="relative rounded-3xl overflow-hidden shadow-xl min-h-[540px] h-[540px] flex flex-col group border border-gray-200 hover:shadow-2xl transition w-full"
                >
                  <div className="absolute inset-0 z-10 flex flex-col h-full w-full p-8 bg-gradient-to-b from-white/90 via-white/80 to-white/90 backdrop-blur-sm">
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-3xl font-balgin-regular mt-3 font-bold mb-2 text-gray-900 drop-shadow-sm">{card.title}</h2>
                      <div className="flex items-end mb-2">
                        <span className="text-2xl font-bold text-[#FA7035] font-balgin-regular mr-1">{card.price}</span>
                        <span className="text-base text-gray-500">{card.period}</span>
                      </div>
                      <div className="font-semibold text-[20px] text-gray-700 mb-4 text-center">{card.description}</div>
                      <ul className="mb-8 space-y-2 text-gray-700">
                        {card.features.map((feature, i) => (
                          <li key={i} className="list-disc list-inside">{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <button className="mt-4 py-2 rounded-lg border-2 border-[#FA7035] text-primary font-semibold bg-[#FFC1A0] hover:bg-primary hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-400">
                      {card.button}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No cards found.</div>
          )}
        </div>
        {/* Modal/Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">{editingId ? "Edit Card" : "Add New Card"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Title (Starter, Pro, Elite)" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input id="price" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input id="period" name="period" value={form.period} onChange={handleChange} placeholder="Period" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div>
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                  <textarea id="features" name="features" value={form.features.join("\n")} onChange={handleFeaturesChange} placeholder="Features (one per line)" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div>
                  <label htmlFor="button" className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input id="button" name="button" value={form.button} onChange={handleChange} placeholder="Button Text" className="input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="btn btn-primary flex-1 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-orange-400">{editingId ? "Update" : "Add"} Card</button>
                  <button type="button" onClick={() => { setForm({ title: "", price: "", period: "", description: "", features: [], button: "" }); setEditingId(null); setShowForm(false); }} className="btn btn-secondary flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}