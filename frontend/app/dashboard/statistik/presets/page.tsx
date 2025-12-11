
"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import PresetSelector from "@/components/statistik/PresetSelector";
import Link from 'next/link';

export default function PresetPage() {
      

  return (
    <div>
      <h1> Presets verwalten </h1>

      <br/>

      <Link 
      href="/dashboard/statistik/presets/edit" 
      className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base" >
        <span> Presets bearbeiten </span> 
      </Link>

      <br/>
      
      <Link 
      href="/dashboard/statistik/presets/new" 
      className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base" >
        <span> Neuen Preset anlegen </span> 
      </Link>
    
    </div>
  );
}