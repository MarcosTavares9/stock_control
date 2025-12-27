import { useState } from 'react'
import './Usuarios.sass'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'

interface Usuario {
  id: string
  nome: string
  email: string
  cargo: string
  status: 'ativo' | 'inativo'
}

function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [usuarios] = useState<Usuario[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      cargo: 'Administrador',
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      cargo: 'Gerente',
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      cargo: 'Operador',
      status: 'inativo'
    }
  ])

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (id: string) => {
    // TODO: Implementar lógica de edição
    console.log('Editar usuário:', id)
  }

  const handleDelete = (id: string) => {
    // TODO: Implementar lógica de exclusão
    console.log('Excluir usuário:', id)
  }

  const handleCreate = () => {
    // TODO: Implementar lógica de criação
    console.log('Criar novo usuário')
  }

  return (
    <div className="usuarios">
      <div className="usuarios__header">
        <div>
          <h1>Usuários</h1>
          <p className="usuarios__subtitle">Gerencie os usuários do sistema</p>
        </div>
        <button className="usuarios__button-create" onClick={handleCreate}>
          <FaPlus size={16} />
          Novo Usuário
        </button>
      </div>

      <div className="usuarios__content">
        <div className="usuarios__search">
          <div className="usuarios__search-input-wrapper">
            <FaSearch className="usuarios__search-icon" />
            <input
              type="text"
              className="usuarios__search-input"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="usuarios__table-wrapper">
          <table className="usuarios__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="usuarios__empty">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.cargo}</td>
                    <td>
                      <span className={`usuarios__status usuarios__status--${usuario.status}`}>
                        {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="usuarios__actions">
                        <button
                          className="usuarios__action-button usuarios__action-button--edit"
                          onClick={() => handleEdit(usuario.id)}
                          title="Editar"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="usuarios__action-button usuarios__action-button--delete"
                          onClick={() => handleDelete(usuario.id)}
                          title="Excluir"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Usuarios

