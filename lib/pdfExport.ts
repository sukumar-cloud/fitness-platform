import jsPDF from 'jspdf';
import { FitnessPlan, UserProfile } from '@/store/fitnessStore';

export function exportToPDF(plan: FitnessPlan, profile: UserProfile) {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    if (yPos + lines.length * (fontSize * 0.4) > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(lines, margin, yPos);
    yPos += lines.length * (fontSize * 0.4) + 5;
  };

  addText('AI Fitness Coach - Personalized Plan', 20, true, '#2563eb');
  yPos += 5;

  addText('User Profile', 16, true);
  addText(`Name: ${profile.name}`, 12);
  addText(`Age: ${profile.age} | Gender: ${profile.gender}`, 12);
  addText(`Height: ${profile.height} cm | Weight: ${profile.weight} kg`, 12);
  addText(`Goal: ${profile.goal} | Level: ${profile.level}`, 12);
  addText(`Location: ${profile.location} | Diet: ${profile.diet}`, 12);
  yPos += 10;

  addText('Daily Motivation', 16, true, '#7c3aed');
  plan.motivation.forEach(quote => {
    addText(quote, 11);
  });
  yPos += 10;

  addText('Personalized Tips', 16, true);
  plan.tips.forEach(tip => {
    addText(`• ${tip}`, 11);
  });
  yPos += 10;

  addText('Workout Plan', 16, true, '#2563eb');
  plan.workoutPlan.forEach(day => {
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    addText(day.day, 14, true);
    day.exercises.forEach(exercise => {
      addText(`${exercise.name}`, 12, true);
      addText(`  Sets: ${exercise.sets} | Reps: ${exercise.reps} | Rest: ${exercise.rest}`, 10);
      addText(`  Notes: ${exercise.notes}`, 10);
    });
    yPos += 5;
  });
  yPos += 10;

  addText('Diet Plan', 16, true, '#2563eb');
  plan.dietPlan.forEach(day => {
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    addText(day.day, 14, true);
    addText(`Breakfast: ${day.meals.breakfast}`, 11);
    addText(`Lunch: ${day.meals.lunch}`, 11);
    addText(`Dinner: ${day.meals.dinner}`, 11);
    addText(`Snacks: ${day.meals.snacks.join(', ')}`, 11);
    yPos += 5;
  });

  doc.save(`fitness-plan-${profile.name}-${new Date().toISOString().split('T')[0]}.pdf`);
}

