import { useState, useEffect } from 'react'
import './UsuariosMobile.sass'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import { CreateUsuarioModal } from './CreateUsuarioModal'
import { listUsuarios, createUsuario, updateUsuario, deleteUsuario } from './settings.service'
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from './settings.types'

function UsuariosMobile() {
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
      <div className="usuarios-mobile">
        <div className="usuarios-mobile__header">
          <div className="usuarios-mobile__header-content">
            <h1>Usuários</h1>
            <p className="usuarios-mobile__subtitle">Gerencie os usuários do sistema</p>
          </div>
          <button className="usuarios-mobile__button-create" onClick={handleCreate}>
            <FaPlus size={18} />
          </button>
        </div>

        <div className="usuarios-mobile__content">
          <div className="usuarios-mobile__search">
            <div className="usuarios-mobile__search-input-wrapper">
              <FaSearch className="usuarios-mobile__search-icon" />
              <input
                type="text"
                className="usuarios-mobile__search-input"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="usuarios-mobile__loading">
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="usuarios-mobile__list">
              {filteredUsuarios.length === 0 ? (
                <div className="usuarios-mobile__empty">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </div>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <div key={usuario.id} className="usuarios-mobile__card">
                    <div className="usuarios-mobile__card-header">
                      <div className="usuarios-mobile__card-info">
                        <h3 className="usuarios-mobile__card-name">{usuario.nome}</h3>
                        <p className="usuarios-mobile__card-email">{usuario.email}</p>
                      </div>
                      <span className={`usuarios-mobile__status usuarios-mobile__status--${usuario.status}`}>
                        {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="usuarios-mobile__card-body">
                      <span className="usuarios-mobile__card-cargo">{usuario.cargo}</span>
                    </div>
                    <div className="usuarios-mobile__card-actions">
                      <button
                        className="usuarios-mobile__action-button usuarios-mobile__action-button--edit"
                        onClick={() => handleEdit(usuario.id)}
                        title="Editar"
                      >
                        <FaEdit size={14} />
                        Editar
                      </button>
                      <button
                        className="usuarios-mobile__action-button usuarios-mobile__action-button--delete"
                        onClick={() => handleDelete(usuario.id)}
                        title="Excluir"
                      >
                        <FaTrash size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
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

export default UsuariosMobile

