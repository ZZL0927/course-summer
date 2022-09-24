import { useState, useCallback, useMemo } from 'react'
import { ISong } from '../libs/models'
import * as songService from '../services/song'

// 此处需要传入初始值用于服务端渲染
export default function useSongs(initSongs: ISong[], initTotal: number) {
  const [loading, setLoading] = useState(false)
  const [skip, setSkip] = useState(initSongs.length)
  const [total, setTotal] = useState(initTotal)
  const [songs, setSongs] = useState<ISong[]>(initSongs)
  const [error, setError] = useState('')

  const hasMore = useMemo(() => {
    return skip < total
  }, [skip, total])

  const listSongs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { code, message, data } = await songService.listSongs()
      if (code === 0) {
        setSongs(data.items)
        setSkip(data.items.length)
        setTotal(data.total)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { code, message, data } = await songService.listSongs({
        skip
      })
      if (code === 0) {
        setSongs(songs.concat(data.items))
        setSkip(skip + data.items.length)
        setTotal(data.total)
      } else {
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [skip, songs])

  return {
    songs,
    hasMore,
    loading,
    error,
    listSongs,
    loadMore
  }
}
