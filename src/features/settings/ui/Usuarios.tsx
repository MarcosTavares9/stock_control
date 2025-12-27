import { useState, useEffect } from 'react'
import './Usuarios.sass'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import { CreateUsuarioModal } from './CreateUsuarioModal'
import { listUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../infra'
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../domain'

function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const data = await listUsuarios()
      setUsuarios(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedUsuario(null)
    setIsModalOpen(true)
  }

  const handleEdit = (id: string) => {
    const usuario = usuarios.find(u => u.id === id)
    if (usuario) {
      setSelectedUsuario(usuario)
      setIsModalOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return
    }

    try {
      await deleteUsuario(id)
      await loadUsuarios()
      alert('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário. Tente novamente.')
    }
  }

  const handleCreateUsuario = async (data: CreateUsuarioRequest) => {
    await createUsuario(data)
    await loadUsuarios()
    alert('Usuário criado com sucesso!')
  }

  const handleUpdateUsuario = async (id: string, data: UpdateUsuarioRequest) => {
    await updateUsuario(id, data)
    await loadUsuarios()
    alert('Usuário atualizado com sucesso!')
  }

  return (
    <>
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

          {loading ? (
            <div className="usuarios__loading">
              <p>Carregando usuários...</p>
            </div>
          ) : (
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
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
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
          )}
        </div>
      </div>

      <CreateUsuarioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUsuario(null)
        }}
        onCreate={handleCreateUsuario}
        onUpdate={handleUpdateUsuario}
        usuario={selectedUsuario}
      />
    </>
  )
}

export default Usuarios

