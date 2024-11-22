;; Collaborative Story Writing Platform

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-voting-closed (err u103))
(define-constant err-invalid-option (err u104))

;; Data Maps
(define-map stories
  { story-id: uint }
  { title: (string-ascii 100), current-chapter: uint, is-complete: bool }
)

(define-map chapters
  { story-id: uint, chapter-id: uint }
  { content: (string-utf8 1000), author: principal }
)

(define-map plot-decisions
  { story-id: uint, decision-id: uint }
  { options: (list 2 (string-ascii 100)), votes: (list 2 uint), is-open: bool }
)

(define-map story-contributors { story-id: uint, author: principal } bool)

;; NFT Definitions
(define-non-fungible-token story-nft uint)

;; Variables
(define-data-var last-story-id uint u0)
(define-data-var last-decision-id uint u0)

;; Private Functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner)
)

;; Public Functions
(define-public (create-story (title (string-ascii 100)))
  (let
    (
      (new-story-id (+ (var-get last-story-id) u1))
    )
    (try! (nft-mint? story-nft new-story-id tx-sender))
    (map-set stories { story-id: new-story-id } { title: title, current-chapter: u0, is-complete: false })
    (var-set last-story-id new-story-id)
    (ok new-story-id)
  )
)

(define-public (add-chapter (story-id uint) (content (string-utf8 1000)))
  (let
    (
      (story (unwrap! (map-get? stories { story-id: story-id }) (err err-not-found)))
      (new-chapter-id (+ (get current-chapter story) u1))
    )
    (asserts! (not (get is-complete story)) (err err-voting-closed))
    (map-set chapters { story-id: story-id, chapter-id: new-chapter-id } { content: content, author: tx-sender })
    (map-set stories { story-id: story-id }
      (merge story { current-chapter: new-chapter-id }))
    (map-set story-contributors { story-id: story-id, author: tx-sender } true)
    (ok new-chapter-id)
  )
)

(define-public (create-plot-decision (story-id uint) (option-a (string-ascii 100)) (option-b (string-ascii 100)))
  (let
    (
      (story (unwrap! (map-get? stories { story-id: story-id }) (err err-not-found)))
      (new-decision-id (+ (var-get last-decision-id) u1))
    )
    (asserts! (not (get is-complete story)) (err err-voting-closed))
    (map-set plot-decisions { story-id: story-id, decision-id: new-decision-id }
      { options: (list option-a option-b), votes: (list u0 u0), is-open: true })
    (var-set last-decision-id new-decision-id)
    (ok new-decision-id)
  )
)

(define-public (vote-on-plot (story-id uint) (decision-id uint) (option uint))
  (let
    (
      (decision (unwrap! (map-get? plot-decisions { story-id: story-id, decision-id: decision-id }) (err err-not-found)))
      (current-votes (get votes decision))
    )
    (asserts! (get is-open decision) (err err-voting-closed))
    (asserts! (or (is-eq option u0) (is-eq option u1)) (err err-invalid-option))
    (ok (map-set plot-decisions { story-id: story-id, decision-id: decision-id }
      (merge decision { votes: (list
        (if (is-eq option u0) (+ (default-to u0 (element-at? current-votes u0)) u1) (default-to u0 (element-at? current-votes u0)))
        (if (is-eq option u1) (+ (default-to u0 (element-at? current-votes u1)) u1) (default-to u0 (element-at? current-votes u1)))
      )})))
  )
)

(define-public (close-voting (story-id uint) (decision-id uint))
  (let
    (
      (decision (unwrap! (map-get? plot-decisions { story-id: story-id, decision-id: decision-id }) (err err-not-found)))
    )
    (asserts! (is-owner) (err err-owner-only))
    (ok (map-set plot-decisions { story-id: story-id, decision-id: decision-id }
      (merge decision { is-open: false })))
  )
)

(define-public (complete-story (story-id uint))
  (let
    (
      (story (unwrap! (map-get? stories { story-id: story-id }) (err err-not-found)))
    )
    (asserts! (is-owner) (err err-owner-only))
    (ok (map-set stories { story-id: story-id }
      (merge story { is-complete: true })))
  )
)

;; Read-only Functions
(define-read-only (get-story (story-id uint))
  (map-get? stories { story-id: story-id })
)

(define-read-only (get-chapter (story-id uint) (chapter-id uint))
  (map-get? chapters { story-id: story-id, chapter-id: chapter-id })
)

(define-read-only (get-plot-decision (story-id uint) (decision-id uint))
  (map-get? plot-decisions { story-id: story-id, decision-id: decision-id })
)

(define-read-only (is-story-contributor (story-id uint) (author principal))
  (default-to false (map-get? story-contributors { story-id: story-id, author: author }))
)

