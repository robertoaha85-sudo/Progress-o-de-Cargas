import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dumbbell, Plus, GripVertical, Trash2, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { WorkoutTemplate, ExerciseTemplate } from '../../types';
import { ConfirmModal } from '../../components/ConfirmModal';
import { generateUUID } from '../../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableExercise: React.FC<{
  exercise: ExerciseTemplate, 
  onUpdate: (id: string, field: string, value: any) => void,
  onRemove: (id: string) => void
}> = ({ exercise, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card p-4 rounded-3xl border border-gray-800 flex gap-3 items-center relative z-0 opacity-90 hover:opacity-100 transition-opacity">
      <div 
        {...attributes} 
        {...listeners}
        className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing touch-none p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Nome do Exercício</label>
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => onUpdate(exercise.id, 'name', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white"
            placeholder="Ex: Supino Reto"
          />
        </div>
        
        <div className="flex flex-col w-full md:w-24">
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1">Séries</label>
          <input
            type="number"
            min="1"
            value={exercise.sets}
            onChange={(e) => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 1)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary text-white"
          />
        </div>
      </div>

      <button
        onClick={() => onRemove(exercise.id)}
        className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors mt-4 md:mt-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

export function WorkoutEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addTemplate, updateTemplate } = useAppStore();
  
  const isEditing = id && id !== 'novo';
  
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [deleteExId, setDeleteExId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      const template = state.templates.find(t => t.id === id);
      if (template) {
        setName(template.name);
        setExercises(template.exercises);
      } else {
        navigate('/treinos');
      }
    } else {
      // Create initial 8 empty exercises
      const initialExercises = Array.from({ length: 8 }).map(() => ({
        id: generateUUID(),
        name: '',
        sets: 3
      }));
      setExercises(initialExercises);
    }
  }, [id, isEditing, state.templates, navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { id: generateUUID(), name: '', sets: 3 }]);
  };

  const updateExercise = (id: string, field: string, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = () => {
    if (deleteExId) {
      setExercises(exercises.filter(ex => ex.id !== deleteExId));
      setDeleteExId(null);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, dê um nome ao treino.');
      return;
    }
    
    // Filter out exercises without names
    const validExercises = exercises.filter(ex => ex.name.trim() !== '');
    if (validExercises.length === 0) {
      alert('Adicione pelo menos um exercício com nome.');
      return;
    }

    const template: WorkoutTemplate = {
      id: isEditing ? id! : generateUUID(),
      name: name.trim(),
      exercises: validExercises
    };

    if (isEditing) {
      updateTemplate(template);
    } else {
      addTemplate(template);
    }
    
    navigate('/treinos');
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex-1 bg-[#151515] rounded-3xl p-6 border border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">{isEditing ? 'Editar Treino' : 'Novo Treino'}</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/treinos')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-full text-sm font-bold transition-colors"
            >
              SALVAR
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-24">
          <div className="bg-card rounded-2xl p-5 border border-gray-800 shrink-0">
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Nome do Treino</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-lg font-bold focus:outline-none focus:border-primary text-white"
              placeholder="Ex: Treino A - Peito"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Exercícios</h3>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={exercises.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {exercises.map(exercise => (
                    <SortableExercise 
                      key={exercise.id} 
                      exercise={exercise} 
                      onUpdate={updateExercise}
                      onRemove={setDeleteExId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <button
              onClick={addExercise}
              className="mt-4 w-full border-2 border-dashed border-gray-800 p-4 rounded-2xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-all text-xs"
            >
              + ADICIONAR NOVO EXERCÍCIO
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteExId}
        title="Remover Exercício"
        message="Tem certeza que deseja remover este exercício do treino?"
        onConfirm={removeExercise}
        onCancel={() => setDeleteExId(null)}
      />
    </div>
  );
}
