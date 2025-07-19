'use client';

import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { z } from 'zod';


import { fileImportSchema, FileImportForm, employeeSchema } from '@/schemas';
import { useGetFileImport } from '@/hooks/useGetFileImport';
import { useUpdateFileImport } from '@/hooks/useUpdateFileImport';
import { MdDelete } from 'react-icons/md';
import { RxUpdate } from 'react-icons/rx';
import Breadcrumbs from '@/app/components/Breadcrumbs';

const employeeFields = ['nom', 'email', 'poste', 'salaire'] as const;

type Employee = z.infer<typeof employeeSchema>;

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const numericId = Number(id);

  const { data, isLoading } = useGetFileImport(numericId);
  const updateMutation = useUpdateFileImport(numericId);

  const {

    handleSubmit,

    control,
    reset,
    getValues,
  } = useForm<FileImportForm>({
    resolver: zodResolver(fileImportSchema),
    defaultValues: {
      fileName: '',
      importedAt: '',
      employees: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'employees',
  });

  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempEmployee, setTempEmployee] = useState<Employee | null>(null);

  // Formulaire du modal
  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    formState: { errors: employeeErrors },
    reset: resetEmployeeForm,
  } = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nom: '',
      email: '',
      poste: '',
      salaire: 0,
    },
  });

  useEffect(() => {
    if (tempEmployee) {
      resetEmployeeForm(tempEmployee);
    }
  }, [tempEmployee, resetEmployeeForm]);

  useEffect(() => {
    if (data) {
      reset({
        fileName: data.fileName || '',
        importedAt: data.importedAt || '',
        employees: data.employees || [],
      });
    }
  }, [data, reset]);

  const onSubmit: SubmitHandler<FileImportForm> = async (formData) => {
    try {
      const hasInvalidSalary = formData.employees.some(
        (emp) => !emp.salaire || emp.salaire <= 0
      );
      if (hasInvalidSalary) {
        toast.error('Le salaire doit être supérieur à 0 pour tous les employés.');
        return;
      }

      const formattedData = {
        ...formData,
        employees: formData.employees.map((emp) => ({
          ...emp,
          salaire: Number(emp.salaire),
        })),
      };

      await updateMutation.mutateAsync(formattedData);
      toast.success('Fichier mis à jour avec succès !');
      router.push('/files');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const openModalForNew = () => {
    setTempEmployee({ nom: '', email: '', poste: '', salaire: 0 });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (index: number) => {
    const emp = getValues(`employees.${index}`) as Employee;
    setTempEmployee(emp);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const saveModal = (data: Employee) => {
    if (editingIndex === null) {
      append(data);
    } else {
      update(editingIndex, data);
    }

    setIsModalOpen(false);
    setTempEmployee(null);
    setEditingIndex(null);
  };

  if (isLoading) return <div className="p-4 text-white">Chargement...</div>;

  return (
    <section className="p-2 text-xs">
      <div>
        <Breadcrumbs />
      </div>
      <h1 className="stat-value my-3">Modification</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 text-white space-y-6">
        <button
          type="button"
          onClick={openModalForNew}
          className="btn btn-secondary btn-soft btn-sm rounded-3xl"
        >
          + Ajouter un employé
        </button>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full mt-4">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Poste</th>
                <th>Salaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {employeeFields.map((attr) => {
                    // for React key, attr is string so safe
                    // Pour afficher la valeur correctement, on récupère la valeur via getValues avec le type sûr
                    const value = getValues(`employees.${index}.${attr}` as const);
                    // Si valeur n'est pas string/number, on convertit en string pour éviter erreur React
                    const displayValue =
                      typeof value === 'string' || typeof value === 'number' ? value : '';

                    return (
                      <td key={attr}>
                        {displayValue}
                      </td>
                    );
                  })}
                  <td>
                    <button
                      type="button"
                      className="btn btn-xs btn-warning mr-2"
                      onClick={() => openModalForEdit(index)}
                    >
                      <RxUpdate />
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs rounded btn-error"
                      onClick={() => {
                        const current = getValues(`employees.${index}`) as Employee;
                        setDeletedEmployees((prev) => [...prev, current]);
                        remove(index);
                      }}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deletedEmployees.length > 0 && (
          <div className="mt-6 border-t border-gray-500 pt-4">
            <h3 className="text-md mb-2 text-yellow-300">Employés supprimés</h3>
            <div className="space-y-3">
              {deletedEmployees.map((emp, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded-lg"
                >
                  <div className="text-sm text-white">
                    {emp.nom} – {emp.email}
                  </div>
                  <button
                    type="button"
                    className="text-xs text-green-400 hover:underline"
                    onClick={() => {
                      append(emp);
                      setDeletedEmployees((prev) => prev.filter((_, j) => j !== i));
                    }}
                  >
                    Restaurer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="btn btn-warning btn-sm rounded-3xl px-4 py-2 mt-6"
        >
          {updateMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-1/4">
            <h3 className="font-semibold text-lg text-center mb-4">
              {editingIndex === null ? 'Nouvel employé' : 'Modifier employé'}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmitEmployee(saveModal)}>
              {employeeFields.map((attr) => (
                <div key={attr} className="flex flex-col">
                  <label className="text-gray-200 mb-1">{attr}</label>
                  <input
                    type={attr === 'salaire' ? 'number' : 'text'}
                    {...registerEmployee(attr as keyof Employee, {
                      valueAsNumber: attr === 'salaire',
                      setValueAs: (v) => (attr === 'salaire' && isNaN(v) ? undefined : v),
                    })}
                    className="input input-sm w-full rounded-3xl"
                  />
                  {employeeErrors?.[attr]?.message && (
                    <p className="text-red-400 text-xs mt-1">
                      {employeeErrors[attr]?.message}
                    </p>
                  )}
                </div>
              ))}


              <div className="modal-action justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-sm rounded-3xl"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-sm btn-primary rounded-3xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
