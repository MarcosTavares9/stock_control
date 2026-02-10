import { useState, useEffect } from 'react'
import './LocalizacaoMobile.sass'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa'
import { CreateLocalizacaoModal } from './CreateLocalizacaoModal'
import { EditLocalizacaoModal } from './EditLocalizacaoModal'
import { listLocalizacoes, deleteLocalizacao } from './location.service'
import { Localizacao as LocalizacaoType } from './location.types'

function LocalizacaoMobile() {
  const [searchTerm, setSearchTerm] = useState('')
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLocalizacao, setSelectedLocalizacao] = useState<LocalizacaoType | null>(null)

  useEffect(() => {
    loadLocalizacoes()
  }, [])

  const loadLocalizacoes = async () => {
    try {
      setLoading(true)
      const data = await listLocalizacoes()
      setLocalizacoes(data)
    } catch (error) {
      console.error('Erro ao carregar localizações:', error)
      alert('Erro ao carregar localizações')
    } finally {
      setLoading(false)
    }
  }

  const filteredLocalizacoes = localizacoes.filter(localizacao =>
    localizacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    localizacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedLocalizacao(null)
    setIsCreateModalOpen(true)
  }

  const handleEdit = (id: string) => {
    const localizacao = localizacoes.find(l => l.id === id)
    if (localizacao) {
      setSelectedLocalizacao(localizacao)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) {
      return
    }

    try {
      await deleteLocalizacao(id)
      await loadLocalizacoes()
      alert('Localização excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir localização:', error)
      alert('Erro ao excluir localização. Tente novamente.')
    }
  }

  return (
    <>
      <div className="localizacao-mobile">
        <div className="localizacao-mobile__header">
          <div className="localizacao-mobile__header-content">
            <h1>Localizações</h1>
            <p className="localizacao-mobile__subtitle">Gerencie as localizações de estoque</p>
          </div>
          <button className="localizacao-mobile__button-create" onClick={handleCreate}>
            <FaPlus size={18} />
          </button>
        </div>

        <div className="localizacao-mobile__content">
          <div className="localizacao-mobile__search">
            <div className="localizacao-mobile__search-input-wrapper">
              <FaSearch className="localizacao-mobile__search-icon" />
              <input
                type="text"
                className="localizacao-mobile__search-input"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="localizacao-mobile__loading">
              <p>Carregando localizações...</p>
            </div>
          ) : (
            <div className="localizacao-mobile__list">
              {filteredLocalizacoes.length === 0 ? (
                <div className="localizacao-mobile__empty">
                  {searchTerm ? 'Nenhuma localização encontrada' : 'Nenhuma localização cadastrada'}
                </div>
              ) : (
                filteredLocalizacoes.map((localizacao) => (
                  <div key={localizacao.id} className="localizacao-mobile__card">
                    <div className="localizacao-mobile__card-header">
                      <div className="localizacao-mobile__card-icon">
                        <FaMapMarkerAlt size={24} />
                      </div>
                      <span className={`localizacao-mobile__status localizacao-mobile__status--${localizacao.ativo ? 'ativo' : 'inativo'}`}>
                        {localizacao.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="localizacao-mobile__card-body">
                      <h3 className="localizacao-mobile__card-title">{localizacao.nome}</h3>
                      {localizacao.descricao && (
                        <p className="localizacao-mobile__card-description">{localizacao.descricao}</p>
                      )}
                    </div>
                    <div className="localizacao-mobile__card-actions">
                      <button
                        className="localizacao-mobile__action-button localizacao-mobile__action-button--edit"
                        onClick={() => handleEdit(localizacao.id)}
                        title="Editar"
                      >
                        <FaEdit size={14} />
                        Editar
                      </button>
                      <button
                        className="localizacao-mobile__action-button localizacao-mobile__action-button--delete"
                        onClick={() => handleDelete(localizacao.id)}
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

      <CreateLocalizacaoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={loadLocalizacoes}
      />

      <EditLocalizacaoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedLocalizacao(null)
        }}
        onUpdate={loadLocalizacoes}
        localizacao={selectedLocalizacao}
      />
    </>
  )
}

export default LocalizacaoMobile

